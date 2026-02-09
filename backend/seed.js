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
        console.log('🌱 Iniciando Seed Completo do Banco de Dados...');
        await client.query('BEGIN');

        // Limpar dados existentes (ordem importa por causa das FKs)
        console.log('... Limpando tabelas antigas');
        await client.query(`
            TRUNCATE TABLE 
            medical_records, hospitalizations, surgeries, sale_items, sales, 
            appointments, vaccinations, pets, tutors, products, health_plans, users 
            RESTART IDENTITY CASCADE
        `);

        // 1. Health Plans
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

        // 2. Users
        console.log('... Criando Usuários');
        const { hash, salt } = hashPassword('123456');
        
        // Admin User
        const adminRes = await client.query(`
            INSERT INTO users (name, email, password_hash, password_salt, role)
            VALUES ('Dr. Ricardo Silva', 'admin@vetsmart.com', $1, $2, 'admin')
            RETURNING id;
        `, [hash, salt]);
        const vetId = adminRes.rows[0].id;

        // Vet User
        const vetRes = await client.query(`
            INSERT INTO users (name, email, password_hash, password_salt, role)
            VALUES ('Dra. Fernanda Costa', 'fernanda@vetpro.com', $1, $2, 'vet')
            RETURNING id;
        `, [hash, salt]);
        const vet2Id = vetRes.rows[0].id;

        // 3. Tutors (Matching mockStore)
        console.log('... Criando Tutores');
        const tutorsData = [
            ['João Silva', 'joao@email.com', '(11) 99999-8888', '123.456.789-00', 'Rua A, 123'],
            ['Maria Oliveira', 'maria@email.com', '(11) 98888-7777', '234.567.890-11', 'Rua B, 456'],
            ['Carlos Lima', 'carlos@email.com', '(11) 97777-6666', '345.678.901-22', 'Rua C, 789']
        ];

        const tutorIds = [];
        for (const t of tutorsData) {
            const res = await client.query(
                'INSERT INTO tutors (name, email, phone, cpf, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                t
            );
            tutorIds.push(res.rows[0].id);
        }

        // 4. Pets (Matching mockStore)
        console.log('... Criando Pets');
        // mockStore: Rex (João), Mia (João), Thor (Maria), Luna (Carlos)
        const petsData = [
            [tutorIds[0], 'Rex', 'Cachorro', 'Pastor Alemão', '2020-01-01', 30.5, planIds[0], 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80'],
            [tutorIds[0], 'Mia', 'Gato', 'Siamês', '2021-06-15', 4.2, planIds[1], 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80'],
            [tutorIds[1], 'Thor', 'Cachorro', 'Bulldog', '2019-11-20', 12.0, planIds[2], 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80'],
            [tutorIds[2], 'Luna', 'Gato', 'Persa', '2022-03-10', 3.8, planIds[1], 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=150&q=80']
        ];

        const petIds = [];
        for (const p of petsData) {
            const res = await client.query(
                'INSERT INTO pets (tutor_id, name, species, breed, birth_date, weight, plan_id, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                p
            );
            petIds.push(res.rows[0].id);
        }

        // 5. Products (Matching mockStore)
        console.log('... Criando Produtos');
        const productsData = [
            ['Vacina V10', 'Vacinas', 85.00, 45, 10, 'VAC-001'],
            ['Ração Royal Canin 10kg', 'Nutrição', 340.00, 24, 15, 'NUT-002'],
            ['Bravecto Gatos', 'Fármacos', 180.00, 8, 5, 'FAR-003'], // Warning stock
            ['Shampoo Antisséptico', 'Higiene', 45.00, 12, 10, 'HIG-004'],
            ['Dipirona Injetável', 'Fármacos', 12.00, 2, 5, 'FAR-005'] // Critical stock
        ];

        const productIds = [];
        for (const p of productsData) {
            const res = await client.query(
                'INSERT INTO products (name, category, price, stock_quantity, min_stock_level, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                p
            );
            productIds.push(res.rows[0].id);
        }

        // 6. Appointments (Matching mockStore + Extra for dashboard)
        console.log('... Criando Agendamentos');
        // Rex: Consulta de Rotina (Hoje 09:00)
        await client.query(
            "INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status, reason) VALUES ($1, $2, date_trunc('day', NOW()) + INTERVAL '9 hours', 'consulta', 'agendado', 'Consulta de Rotina')",
            [petIds[0], vetId]
        );
        // Mia: Vacina (Hoje 10:30) - Concluído
        await client.query(
            "INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status, reason) VALUES ($1, $2, date_trunc('day', NOW()) + INTERVAL '10 hours 30 minutes', 'vacina', 'concluido', 'Vacina V10')",
            [petIds[1], vet2Id]
        );
        // Thor: Cirurgia (Hoje 14:00)
        await client.query(
            "INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status, reason) VALUES ($1, $2, date_trunc('day', NOW()) + INTERVAL '14 hours', 'cirurgia', 'agendado', 'Castração')",
            [petIds[2], vetId]
        );
         // Luna: Consulta (Amanhã 11:00)
         await client.query(
            "INSERT INTO appointments (pet_id, vet_id, appointment_date, type, status, reason) VALUES ($1, $2, date_trunc('day', NOW()) + INTERVAL '1 day 11 hours', 'consulta', 'agendado', 'Checkup')",
            [petIds[3], vetId]
        );

        // 7. Sales (Matching mockStore)
        console.log('... Criando Vendas');
        // Venda 1: R$ 150.00 (Pix)
        const sale1 = await client.query(
            "INSERT INTO sales (user_id, tutor_id, total_amount, payment_method, status, sale_date) VALUES ($1, $2, 150.00, 'Pix', 'concluido', date_trunc('day', NOW()) + INTERVAL '8 hours 30 minutes') RETURNING id",
            [vetId, tutorIds[0]]
        );
        // Venda 2: R$ 85.50 (Cartão)
        const sale2 = await client.query(
            "INSERT INTO sales (user_id, tutor_id, total_amount, payment_method, status, sale_date) VALUES ($1, $2, 85.50, 'Cartão Crédito', 'concluido', date_trunc('day', NOW()) + INTERVAL '9 hours 15 minutes') RETURNING id",
            [vetId, tutorIds[0]]
        );
        
        // Itens da venda (simbólico)
        await client.query('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 150.00)', [sale1.rows[0].id, productIds[0]]);
        await client.query('INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 85.50)', [sale2.rows[0].id, productIds[3]]);

        // 8. Hospitalizations (Matching mockStore)
        console.log('... Criando Internações');
        // Rex: Gastroenterite
        await client.query(`
            INSERT INTO hospitalizations (pet_id, bay, reason, status, next_medication_time, admission_date) 
            VALUES ($1, 'C-01', 'Gastroenterite', 'stable', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '1 day')`,
            [petIds[0]]
        );
        // Mia: Observação Pós-Cirúrgica
        await client.query(`
            INSERT INTO hospitalizations (pet_id, bay, reason, status, next_medication_time, admission_date) 
            VALUES ($1, 'G-01', 'Observação Pós-Cirúrgica', 'recovering', NOW() + INTERVAL '4 hours', NOW() - INTERVAL '4 hours')`,
            [petIds[1]]
        );

        // 9. Surgeries (Matching mockStore)
        console.log('... Criando Cirurgias');
        // Thor: Castração
        await client.query(
            "INSERT INTO surgeries (pet_id, vet_id, procedure_name, surgery_date, status, checklist) VALUES ($1, $2, 'Castração', date_trunc('day', NOW()) + INTERVAL '14 hours', 'agendado', $3)",
            [petIds[2], vetId, JSON.stringify({ jejum: true, exames: true, termo: true, anestesia: false })]
        );

        // 10. Medical Records (Populating ALL pets to fix orphaned links)
        console.log('... Criando Prontuários');
        
        // Rex
        await client.query(`
            INSERT INTO medical_records (pet_id, vet_id, date, subjective, objective, assessment, plan, diagnosis, urgency)
            VALUES ($1, $2, '2023-12-15 10:00:00', 'Tutor relata vômito há 2 dias.', 'Desidratação leve, dor abdominal.', 'Gastroenterite', 'Fluidoterapia e antiemético.', 'Gastroenterite', 'Média')
        `, [petIds[0], vetId]);

        // Mia (Adding one so link works)
        await client.query(`
            INSERT INTO medical_records (pet_id, vet_id, date, subjective, objective, assessment, plan, diagnosis, urgency)
            VALUES ($1, $2, '2023-11-20 14:30:00', 'Checkup anual e vacinação.', 'Escore corporal ideal, mucosas coradas.', 'Hígida.', 'Vacina V10 aplicada.', 'Rotina', 'Baixa')
        `, [petIds[1], vet2Id]);

        // Thor (Adding one so link works)
        await client.query(`
            INSERT INTO medical_records (pet_id, vet_id, date, subjective, objective, assessment, plan, diagnosis, urgency)
            VALUES ($1, $2, '2024-01-10 09:15:00', 'Avaliação pré-cirúrgica para castração.', 'Testículos tópicos, exames de sangue normais.', 'Apto para cirurgia.', 'Agendar castração.', 'Pré-operatório', 'Baixa')
        `, [petIds[2], vetId]);

        // Luna (Adding one so link works)
        await client.query(`
            INSERT INTO medical_records (pet_id, vet_id, date, subjective, objective, assessment, plan, diagnosis, urgency)
            VALUES ($1, $2, '2024-02-01 16:00:00', 'Prurido em orelha direita.', 'Secreção ceruminosa escura em OD.', 'Otite externa.', 'Limpeza e medicação tópica.', 'Otite', 'Baixa')
        `, [petIds[3], vetId]);

        await client.query('COMMIT');
        console.log('✅ Seed COMPLETO concluído com sucesso!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erro no Seed:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
