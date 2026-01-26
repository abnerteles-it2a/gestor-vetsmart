import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('📦 Inicializando Schema...');
        await client.query('BEGIN');

        // Users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                password_salt VARCHAR(255),
                role VARCHAR(50) DEFAULT 'vet',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tutors
        await client.query(`
            CREATE TABLE IF NOT EXISTS tutors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                cpf VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Health Plans
        await client.query(`
            CREATE TABLE IF NOT EXISTS health_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                description TEXT,
                benefits JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Pets
        await client.query(`
            CREATE TABLE IF NOT EXISTS pets (
                id SERIAL PRIMARY KEY,
                tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                species VARCHAR(50) NOT NULL,
                breed VARCHAR(100),
                birth_date DATE,
                weight DECIMAL(5,2),
                gender VARCHAR(10),
                photo_url TEXT,
                medical_history TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Ensure plan_id exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pets' AND column_name='plan_id') THEN
                    ALTER TABLE pets ADD COLUMN plan_id INTEGER REFERENCES health_plans(id);
                END IF;
            END $$;
        `);

        // Products
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                sku VARCHAR(50) UNIQUE,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                cost_price DECIMAL(10,2),
                stock_quantity INTEGER DEFAULT 0,
                min_stock_level INTEGER DEFAULT 5,
                unit VARCHAR(20) DEFAULT 'un',
                expiry_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Appointments
        await client.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
                vet_id INTEGER REFERENCES users(id),
                appointment_date TIMESTAMP NOT NULL,
                reason VARCHAR(255),
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) DEFAULT 'agendado',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Sales
        await client.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                tutor_id INTEGER REFERENCES tutors(id),
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50),
                status VARCHAR(50) DEFAULT 'concluido',
                sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Sale Items
        await client.query(`
            CREATE TABLE IF NOT EXISTS sale_items (
                id SERIAL PRIMARY KEY,
                sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL
            );
        `);

        // Surgeries
        await client.query(`
            CREATE TABLE IF NOT EXISTS surgeries (
                id SERIAL PRIMARY KEY,
                pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
                vet_id INTEGER REFERENCES users(id),
                procedure_name VARCHAR(255) NOT NULL,
                surgery_date TIMESTAMP NOT NULL,
                status VARCHAR(50) DEFAULT 'agendado',
                checklist JSONB DEFAULT '{}',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Campaigns
        await client.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                target_audience VARCHAR(100),
                status VARCHAR(50) DEFAULT 'draft',
                metrics JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Hospitalizations
        await client.query(`
            CREATE TABLE IF NOT EXISTS hospitalizations (
                id SERIAL PRIMARY KEY,
                pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
                bay VARCHAR(50) NOT NULL,
                reason TEXT,
                status VARCHAR(50) DEFAULT 'stable',
                admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                next_medication_time TIMESTAMP,
                vitals_history JSONB DEFAULT '[]',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('COMMIT');
        console.log('✅ Schema inicializado com sucesso.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erro na migração:', e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
