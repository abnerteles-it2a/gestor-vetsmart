import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(String(password), salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Iniciando Seed do Banco de Dados...');
        await client.query('BEGIN');

        // 0. Health Plans
        console.log('... Criando Planos de Saúde');
        const plansData = [
            ['Básico', 89.90, 'Cobertura essencial para filhotes e checkups anuais.', '["2 consultas/ano", "10% desc. em serviços"]'],
            ['Premium', 149.90, 'Cobertura completa com vacinas e consultas ilimitadas.', '["Consultas ilimitadas", "20% desc. em serviços", "Vacinas incluídas"]'],
            ['VIP', 249.90, 'Experiência exclusiva com telemedicina e descontos em cirurgias.', '["Consultas + Vacinas", "30% desc. cirurgias", "Telemedicina 24h"]']
        ];
        const planIds = [];
        for (const p of plansData) {
            const res = await client.query(
                'INSERT INTO health_plans (name, price, description, benefits) VALUES ($1, $2, $3, $4) RETURNING id',
                p
            );
            planIds.push(res.rows[0].id);
        }

        // 1. Users
        console.log('... Criando Usuários');
        const { hash, salt } = hashPassword('123456');
        const userRes = await client.query(`
            INSERT INTO users (name, email, password_hash, password_salt, role)
            VALUES ('Dr. Ricardo Silva', 'admin@vetsmart.com', $1, $2, 'admin')
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        `, [hash, salt]);
        const vetId = userRes.rows[0].id;

        // 2. Tutors
        console.log('... Criando Tutores');
        const tutorsData = [
            ['João Silva', 'joao@email.com', '(11) 99999-8888'],
            ['Maria Oliveira', 'maria@email.com', '(11) 98888-7777'],
            ['Carlos Lima', 'carlos@email.com', '(11) 97777-6666']
        ];

        const tutorIds = [];
        for (const t of tutorsData) {
            const res = await client.query(
                'INSERT INTO tutors (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
                t
            );
            tutorIds.push(res.rows[0].id);
        }

        // 3. Pets
        console.log('... Criando Pets');
        const petsData = [
            [tutorIds[0], 'Rex', 'Cão', 'Pastor Alemão', '2020-01-01', 30.5, planIds[0]],
            [tutorIds[0], 'Mia', 'Gato', 'Siamês', '2021-06-15', 4.2, planIds[1]],
            [tutorIds[1], 'Thor', 'Cão', 'Bulldog', '2019-11-20', 12.0, planIds[2]],
            [tutorIds[2], 'Luna', 'Gato', 'Persa', '2022-03-10', 3.8, planIds[1]]
        ];

        const petIds = [];
        for (const p of petsData) {
            const res = await client.query(
                'INSERT INTO pets (tutor_id, name, species, breed, birth_date, weight, plan_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                p
            );
            petIds.push(res.rows[0].id);
        }

        // 4. Products
        console.log('... Criando Produtos');
        const productsData = [
            ['Vacina V10', 'Biomédicos', 85.00, 45, 10],
            ['Ração Royal Canin 10kg', 'Nutrição', 340.00, 24, 15],
            ['Shampoo Antisséptico', 'Higiene', 45.00, 12, 10],
            ['Bravecto Gatos', 'Fármacos', 180.00, 8, 5],
            ['Dipirona Injetável', 'Fármacos', 12.00, 2, 5]
        ];

        const productIds = [];
        for (const p of productsData) {
            const res = await client.query(
                'INSERT INTO products (name, category, price, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                p
            );
            productIds.push(res.rows[0].id);
        }

        // 5. Appointments
        console.log('... Criando Agendamentos');
        await client.query(
            'INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status) VALUES ($1, $2, NOW() + INTERVAL \'1 day\', \'consulta\', \'agendado\')',
            [petIds[0], vetId]
        );
        await client.query(
            'INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status, reason) VALUES ($1, $2, NOW() - INTERVAL \'2 hours\', \'vacina\', \'concluido\', \'Vacina V10 Mensal\')',
            [petIds[1], vetId]
        );

        // 6. Sales
        console.log('... Criando Vendas');
        const saleRes = await client.query(
            'INSERT INTO sales (user_id, tutor_id, total_amount, payment_method, status) VALUES ($1, $2, 425.00, \'Cartão Crédito\', \'concluido\') RETURNING id',
            [vetId, tutorIds[0]]
        );
        const saleId = saleRes.rows[0].id;

        await client.query(
            'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 85.00)',
            [saleId, productIds[0]] // Vacina
        );
        await client.query(
            'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 340.00)',
            [saleId, productIds[1]] // Ração
        );

        // 7. Hospitalizations
        console.log('... Criando Internações');
        await client.query(`
            INSERT INTO hospitalizations (pet_id, bay, reason, status, next_medication_time, vitals_history) 
            VALUES ($1, 'C-01', 'Pós-op Ortopédico', 'recovering', NOW() + INTERVAL '2 hours', $2)`,
            [petIds[0], JSON.stringify([{ time: new Date().toISOString(), temp: 38.5, heart_rate: 100 }])]
        );
        await client.query(`
            INSERT INTO hospitalizations (pet_id, bay, reason, status, next_medication_time, vitals_history) 
            VALUES ($1, 'G-01', 'Desidratação Grave', 'critical', NOW() + INTERVAL '1 hour', $2)`,
            [petIds[1], JSON.stringify([{ time: new Date().toISOString(), temp: 39.2, heart_rate: 140 }])]
        );

        // 8. Surgeries
        console.log('... Criando Cirurgias');
        await client.query(
            'INSERT INTO surgeries (pet_id, vet_id, procedure_name, surgery_date, status, checklist) VALUES ($1, $2, \'Castração\', NOW() + INTERVAL \'2 days\', \'agendado\', $3)',
            [petIds[2], vetId, JSON.stringify({ jejum: true, exames: true, termo: true, anestesia: false })]
        );

        await client.query('COMMIT');
        console.log('✅ Seed concluído com sucesso!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erro no Seed:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
