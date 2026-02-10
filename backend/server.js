import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente. .env.local tem precedência sobre .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Fallback para quando o servidor roda no diretório onde o .env está (ex: Amplify Compute)
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('--- Configuração de Ambiente ---');
console.log('Diretório Atual (__dirname):', __dirname);
console.log('Arquivo em execução (__filename):', __filename);
console.log('DATABASE_URL definida?', process.env.DATABASE_URL ? 'SIM' : 'NÃO');
if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL Host:', dbUrl.split('@')[1]?.split(':')[0] || 'Oculto/Inválido');
}
console.log('-------------------------------');

import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import os from 'os';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-vetpro';

// Knowledge Base Configuration
const storage = new Storage();
const BUCKET_NAME = `${process.env.GOOGLE_CLOUD_PROJECT}-knowledge-base`;

// Vertex AI Configuration
let vertexAIClient = null;
let generativeModel = null;
let generativeModelFlash = null; // Optimized for long context (RAG)

try {
    // Handle Google Credentials from JSON string in environment variable
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON.trim();
        console.log(`🔑 Recebida GOOGLE_CREDENTIALS_JSON com ${credentialsJson.length} caracteres.`);
        
        // Remove wrapping backticks if present
        if (credentialsJson.startsWith('`')) {
            if (credentialsJson.endsWith('`')) {
                credentialsJson = credentialsJson.slice(1, -1);
            } else {
                credentialsJson = credentialsJson.substring(1);
            }
        }
        
        // Validação básica antes de tentar parsear
        if (!credentialsJson.startsWith('{') || !credentialsJson.endsWith('}')) {
             console.error('❌ ERRO CRÍTICO: GOOGLE_CREDENTIALS_JSON parece estar truncada ou mal formatada (não começa/termina com chaves).');
             console.error(`   Início: ${credentialsJson.substring(0, 10)}...`);
             console.error(`   Fim: ...${credentialsJson.substring(credentialsJson.length - 10)}`);
        }

        try {
            const credentials = JSON.parse(credentialsJson);

            // SANITIZAÇÃO DE CREDENCIAIS
            // Remove backticks internos que podem vir de copy-paste (ex: "auth_uri": " `https://...` ")
            const fieldsToSanitize = ['auth_uri', 'token_uri', 'auth_provider_x509_cert_url', 'client_x509_cert_url'];
            fieldsToSanitize.forEach(field => {
                if (credentials[field] && typeof credentials[field] === 'string') {
                     if (credentials[field].includes('`') || credentials[field].trim() !== credentials[field]) {
                         console.warn(`⚠️ Aviso: Limpando caracteres inválidos detectados em '${field}' das credenciais.`);
                         credentials[field] = credentials[field].replace(/`/g, '').trim();
                     }
                }
            });

            // Na Vercel, apenas /tmp é gravável
            const tmpDir = os.tmpdir();
            const credentialsPath = path.join(tmpDir, 'google-credentials.json');
            fs.writeFileSync(credentialsPath, JSON.stringify(credentials)); // Escreve o objeto sanitizado
            process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
            console.log(`🔑 Credenciais do Google Cloud sanitizadas e configuradas em ${credentialsPath}`);

        } catch (parseError) {
             console.error('❌ ERRO CRÍTICO ao parsear JSON das credenciais:', parseError.message);
             // Fallback: Tenta escrever o JSON original mesmo assim, caso o erro seja irrelevante
             const tmpDir = os.tmpdir();
             const credentialsPath = path.join(tmpDir, 'google-credentials.json');
             fs.writeFileSync(credentialsPath, credentialsJson);
             process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
        }
    }

    // Configuração usando credenciais do ambiente ou ADC (Application Default Credentials)
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';
    // Usando Gemini 2.5 Flash (Mais recente e rápido)
    const modelName = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.0-flash-001';
    // Fallback to Flash
    const flashModelName = 'gemini-2.0-flash-001';

    if (projectId) {
        vertexAIClient = new VertexAI({ project: projectId, location: location });
        generativeModel = vertexAIClient.getGenerativeModel({ model: modelName });
        // Initialize Flash model for RAG tasks (supports larger context)
        generativeModelFlash = vertexAIClient.getGenerativeModel({ model: flashModelName });
        console.log(`✨ Vertex AI inicializado: Project=${projectId}, Model=${modelName}, Flash=${flashModelName}`);
    } else {
        console.warn('⚠️ GOOGLE_CLOUD_PROJECT não definido. Funcionalidades de IA estarão indisponíveis no backend.');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Vertex AI:', error);
}

// --- HELPER FUNCTIONS ---
// Helper function to handle 429 errors with exponential backoff
async function generateContentWithRetry(model, prompt, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            // Check for 429 or other retryable errors (sometimes quota errors come with specific messages)
            const isRetryable = error.code === 429 ||
                (error.message && error.message.includes('429')) ||
                (error.message && error.message.includes('Resource has been exhausted'));

            if (isRetryable) {
                console.warn(`⚠️ Erro 429 (Cota excedida/Rate Limit) na tentativa ${i + 1}/${retries}. Retentando em ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Throw other errors immediately
            }
        }
    }
    throw new Error(`Falha após ${retries} tentativas devido a limite de cota (429).`);
}

function parseAIJSON(text) {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Find the first '{' or '[' and the last '}' or ']'
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');

        let start = -1;
        let end = -1;

        // Determine if we are looking for an object or array
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            start = firstBrace;
            end = cleanText.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            start = firstBracket;
            end = cleanText.lastIndexOf(']');
        }

        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        try {
            return JSON.parse(cleanText);
        } catch (e1) {
            // First retry: Try to escape unescaped newlines inside strings
            // Heuristic: Replace newlines that are NOT followed by structural characters
            // Structural chars: { } [ ] , " (and optional whitespace)
            console.warn('⚠️ JSON parse failed, attempting auto-repair of newlines...');
            const repairedText = cleanText.replace(/\n(?!\s*[\{\}\[\]",])/g, '\\n');
            return JSON.parse(repairedText);
        }
    } catch (e) {
        console.error('❌ Erro ao fazer parse do JSON da IA. Texto recebido:', text);
        console.error('Detalhe do erro:', e.message);
        return null; // Return null to indicate failure
    }
}

// --- RAG HELPER ---
async function getKnowledgeBaseFiles() {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const [exists] = await bucket.exists();
        if (!exists) return [];

        const [files] = await bucket.getFiles({ prefix: 'docs/' });

        // Map to Vertex AI Part format
        return files.map(file => ({
            fileData: {
                mimeType: file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
                fileUri: `gs://${BUCKET_NAME}/${file.name}`
            }
        }));
    } catch (e) {
        console.warn('⚠️ Falha ao listar Knowledge Base (pode ser ignorado se não houver bucket):', e.message);
        return [];
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration (Pool)
// Configuração para Neon/Postgres com SSL obrigatório em produção
console.log('🔌 Inicializando pool de conexão com o banco de dados...');
if (!process.env.DATABASE_URL) {
    console.error('❌ ERRO: DATABASE_URL não definida no ambiente!');
}

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.AMPLIFY ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
    console.error('❌ Erro inesperado no pool de conexão do PostgreSQL:', err);
});

// --- HELPER FUNCTIONS ---

function hashPassword(password, salt) {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(String(password || ''), s, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
}

function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

// --- SCHEMA MIGRATION ---
async function ensureSchema() {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ DATABASE_URL não definida. O backend não conectará ao banco de dados.');
        return;
    }

    const client = await pool.connect();
    try {
        console.log('📦 Verificando schema do banco de dados...');

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

        // Update Pets to include plan_id
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
                supplier VARCHAR(255),
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
                room VARCHAR(50) DEFAULT 'Sala 1',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Update Appointments to include room
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='room') THEN
                    ALTER TABLE appointments ADD COLUMN room VARCHAR(50) DEFAULT 'Sala 1';
                END IF;
            END $$;
        `);

        // Sales
        await client.query(`
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                tutor_id INTEGER REFERENCES tutors(id),
                pet_id INTEGER REFERENCES pets(id),
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50),
                status VARCHAR(50) DEFAULT 'concluido',
                sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                service_type VARCHAR(100)
            );
        `);

        // Update Sales to include description, service_type and pet_id
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='description') THEN
                    ALTER TABLE sales ADD COLUMN description TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='service_type') THEN
                    ALTER TABLE sales ADD COLUMN service_type VARCHAR(100);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='pet_id') THEN
                    ALTER TABLE sales ADD COLUMN pet_id INTEGER REFERENCES pets(id);
                END IF;
            END $$;
        `);

        // Update Products to include supplier
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='supplier') THEN
                    ALTER TABLE products ADD COLUMN supplier VARCHAR(255);
                END IF;
            END $$;
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

        // Vaccinations
        await client.query(`
            CREATE TABLE IF NOT EXISTS vaccinations (
                id SERIAL PRIMARY KEY,
                pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
                vaccine_name VARCHAR(255) NOT NULL,
                dose_number INTEGER DEFAULT 1,
                application_date DATE NOT NULL,
                next_due_date DATE,
                batch_number VARCHAR(100),
                vet_id INTEGER REFERENCES users(id),
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

        // Ensure Admin User
        const adminEmail = 'admin@vetpro.com';
        const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        
        if (adminCheck.rows.length === 0) {
            console.log('👤 Criando usuário admin padrão...');
            const { hash, salt } = hashPassword('123456');
            await client.query(`
                INSERT INTO users (name, email, password_hash, password_salt, role)
                VALUES ('Dr. Ricardo Silva', $1, $2, $3, 'admin')
                ON CONFLICT (email) DO NOTHING
            `, [adminEmail, hash, salt]);
        }

        await client.query('COMMIT');
        console.log('✅ Schema verificado com sucesso.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erro na migração do schema:', e);
    } finally {
        client.release();
    }
}

// Inicializa schema ao arrancar
ensureSchema();

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), db: process.env.DATABASE_URL ? 'configured' : 'missing' });
});

// AUTH
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const { hash, salt } = hashPassword(password);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, password_salt, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [name, email, hash, salt, role || 'vet']
        );
        const user = result.rows[0];
        const token = generateToken(user);
        res.status(201).json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

        const user = result.rows[0];
        const { hash } = hashPassword(password, user.password_salt);

        if (hash !== user.password_hash) return res.status(401).json({ error: 'Senha incorreta' });

        const token = generateToken(user);
        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        console.error('❌ Erro crítico no login:', err);
        res.status(500).json({
            error: 'Erro no login',
            details: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });
    }
});

// TUTORS
app.get('/api/tutors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tutors ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar tutores' });
    }
});

app.post('/api/tutors', async (req, res) => {
    const { name, phone, email, cpf, address } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tutors (name, phone, email, cpf, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, phone, email, cpf, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar tutor' });
    }
});

// PETS
app.get('/api/pets', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, t.name as tutor_name,
            (SELECT MIN(appointment_date) FROM appointments WHERE pet_id = p.id AND appointment_date >= CURRENT_DATE AND status != 'cancelado') as next_appointment
            FROM pets p 
            LEFT JOIN tutors t ON p.tutor_id = t.id 
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar pets' });
    }
});

app.post('/api/pets', async (req, res) => {
    const { name, species, breed, tutor_id, weight, birth_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO pets (name, species, breed, tutor_id, weight, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, species, breed, tutor_id, weight, birth_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar pet' });
    }
});

app.put('/api/pets/:id', async (req, res) => {
    const { id } = req.params;
    const { name, species, breed, weight, birth_date, allergies, medical_history } = req.body;
    try {
        const result = await pool.query(
            `UPDATE pets 
             SET name = $1, species = $2, breed = $3, weight = $4, birth_date = $5, medical_history = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [name, species, breed, weight, birth_date, medical_history || allergies, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pet não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar pet' });
    }
});

// APPOINTMENTS
app.get('/api/appointments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, p.name as pet_name, p.species, t.name as tutor_name, t.phone as tutor_phone, u.name as vet_name
            FROM appointments a
            LEFT JOIN pets p ON a.pet_id = p.id
            LEFT JOIN tutors t ON p.tutor_id = t.id
            LEFT JOIN users u ON a.vet_id = u.id
            ORDER BY a.appointment_date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

app.post('/api/appointments', async (req, res) => {
    const { pet_id, vet_id, appointment_date, type, reason, room, status, notes } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO appointments (pet_id, vet_id, appointment_date, type, reason, room, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [pet_id, vet_id, appointment_date, type, reason, room || 'Sala 1', status || 'agendado', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao agendar' });
    }
});

// INVENTORY
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

app.post('/api/products', authenticateToken, async (req, res) => {
    const { name, category, price, stock_quantity, min_stock_level, sku, supplier, expiry_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, category, price, stock_quantity, min_stock_level, sku, supplier, expiry_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, category, price, stock_quantity, min_stock_level, sku, supplier, expiry_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// SALES
app.get('/api/sales', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});

// SURGERIES
app.get('/api/surgeries', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, p.name as pet_name, t.name as tutor_name, u.name as vet_name 
            FROM surgeries s
            LEFT JOIN pets p ON s.pet_id = p.id
            LEFT JOIN tutors t ON p.tutor_id = t.id
            LEFT JOIN users u ON s.vet_id = u.id
            ORDER BY s.surgery_date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar cirurgias' });
    }
});

app.post('/api/surgeries', async (req, res) => {
    const { pet_id, vet_id, procedure_name, surgery_date, status, checklist, notes } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO surgeries (pet_id, vet_id, procedure_name, surgery_date, status, checklist, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [pet_id, vet_id, procedure_name, surgery_date, status, checklist || {}, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao agendar cirurgia' });
    }
});

// MEDICAL RECORDS
app.get('/api/medical-records/:petId', authenticateToken, async (req, res) => {
    const { petId } = req.params;
    try {
        const result = await pool.query(
            `SELECT mr.*, u.name as vet_name 
             FROM medical_records mr 
             LEFT JOIN users u ON mr.vet_id = u.id 
             WHERE mr.pet_id = $1 
             ORDER BY mr.date DESC`,
            [petId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar prontuários' });
    }
});

app.post('/api/medical-records', authenticateToken, async (req, res) => {
    const { petId, vetId, date, subjective, objective, assessment, plan, diagnosis, urgency } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO medical_records (pet_id, vet_id, date, subjective, objective, assessment, plan, diagnosis, urgency)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [petId, vetId, date, subjective, objective, assessment, plan, diagnosis, urgency]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar prontuário' });
    }
});

// CAMPAIGNS
app.get('/api/campaigns', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns ORDER BY start_date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar campanhas' });
    }
});

// VETS (Users with role vet/admin)
app.get('/api/users/vets', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, role FROM users WHERE role IN ('vet', 'admin') ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar veterinários' });
    }
});

// HEALTH PLANS
app.get('/api/plans', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM health_plans ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar planos' });
    }
});

// SALES (POST)
app.post('/api/sales', authenticateToken, async (req, res) => {
    const { tutor_id, pet_id, total_amount, payment_method, status, items, description, service_type } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const saleRes = await client.query(
            'INSERT INTO sales (user_id, tutor_id, pet_id, total_amount, payment_method, status, description, service_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [req.user.id, tutor_id, pet_id, total_amount, payment_method, status || 'concluido', description, service_type]
        );
        const sale = saleRes.rows[0];

        if (items && items.length > 0) {
            for (const item of items) {
                await client.query(
                    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                    [sale.id, item.product_id, item.quantity, item.unit_price]
                );
                // Update stock
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json(sale);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar venda' });
    } finally {
        client.release();
    }
});

// HOSPITALIZATION
app.get('/api/hospitalization', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, p.name as pet_name, p.species, t.name as tutor_name
            FROM hospitalizations h
            JOIN pets p ON h.pet_id = p.id
            JOIN tutors t ON p.tutor_id = t.id
            ORDER BY h.admission_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar internações' });
    }
});

app.post('/api/hospitalization', authenticateToken, async (req, res) => {
    const { pet_id, bay, reason, status, next_medication_time, notes } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO hospitalizations (pet_id, bay, reason, status, next_medication_time, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [pet_id, bay, reason, status || 'stable', next_medication_time, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar internação' });
    }
});

app.put('/api/hospitalization/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { bay, status, next_medication_time, vitals, notes } = req.body;
    try {
        const result = await pool.query(
            `UPDATE hospitalizations 
             SET bay = COALESCE($1, bay), 
                 status = COALESCE($2, status), 
                 next_medication_time = COALESCE($3, next_medication_time),
                 vitals_history = CASE WHEN $4::jsonb IS NOT NULL THEN vitals_history || $4::jsonb ELSE vitals_history END,
                 notes = COALESCE($5, notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [bay, status, next_medication_time, vitals ? JSON.stringify(vitals) : null, notes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar internação' });
    }
});

app.post('/api/campaigns', async (req, res) => {
    const { title, description, start_date, end_date, target_audience, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO campaigns (title, description, start_date, end_date, target_audience, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, start_date, end_date, target_audience, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar campanha' });
    }
});

// DASHBOARD KPIS
app.get('/api/dashboard/kpis', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Parallel queries for performance
        const [salesRes, apptsRes, alertsRes] = await Promise.all([
            pool.query('SELECT SUM(total_amount) as total, COUNT(*) as count FROM sales WHERE DATE(sale_date) = $1', [today]),
            pool.query("SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = $1 AND status != 'cancelado'", [today]),
            pool.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= min_stock_level")
        ]);

        res.json({
            todaySales: salesRes.rows[0].total || 0,
            todayAppointments: parseInt(apptsRes.rows[0].count),
            inventoryAlerts: parseInt(alertsRes.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar KPIs' });
    }
});

// --- AI FEATURES (Vertex AI) ---

// 1. Suggest Treatment Plan (RAG Enhanced)
app.post('/api/ai/suggest-treatment', authenticateToken, async (req, res) => {
    // Prefer Flash model for RAG (larger context), fallback to Pro
    const model = generativeModelFlash || generativeModel;
    if (!model) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { species, breed, age, weight, symptoms, history } = req.body;

    // Fetch RAG Documents (Vertex AI Grounding via GCS)
    const knowledgeBaseFiles = await getKnowledgeBaseFiles();
    const hasContext = knowledgeBaseFiles.length > 0;

    let prompt = `
        Atue como um veterinário especialista. Crie um plano de tratamento preliminar para um paciente com as seguintes características:
        - Espécie: ${species}
        - Raça: ${breed}
        - Idade: ${age}
        - Peso: ${weight}
        - Sintomas atuais: ${symptoms}
        - Histórico relevante: ${history || 'Nenhum informado'}
    `;

    if (hasContext) {
        prompt += `
        CONTEXTO ADICIONAL (RAG):
        Você tem acesso a documentos médicos veterinários anexados (ex: protocolos, artigos do PubMed).
        Utilize ESTES documentos para embasar suas sugestões de diagnóstico e tratamento, citando-os se relevante.
        Se os documentos contiverem protocolos específicos para a condição (ex: Dermatite), priorize-os.
        `;
    }

    prompt += `
        FONTE DE DADOS:
        - Utilize os documentos anexados (se houver).
        - Utilize a BUSCA DO GOOGLE (Grounding) para verificar informações recentes, novos tratamentos ou surtos na região (Brasil).
        
        O plano deve conter:
        1. Possíveis diagnósticos diferenciais (liste 3)
        2. Exames sugeridos
        3. Tratamento sintomático inicial recomendado (Cite protocolos dos docs se aplicável)
        4. Sinais de alerta para retorno imediato
        5. Fontes utilizadas (mencione se veio dos docs internos ou da web)

        Responda em formato JSON estruturado.
    `;

    try {
        console.time('VertexAI-SuggestTreatment'); // Início da medição de tempo
        const request = {
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    ...knowledgeBaseFiles // Attach GCS files as multimodal input
                ]
            }],
            tools: [
                { googleSearchRetrieval: {} } // Enable Google Search Grounding
            ]
        };

        const result = await model.generateContent(request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        console.timeEnd('VertexAI-SuggestTreatment'); // Fim da medição de tempo

        // Tenta extrair JSON se o modelo retornar markdown
        const jsonResponse = parseAIJSON(text) || { raw_text: text };

        // Add metadata about RAG usage
        jsonResponse._meta = {
            rag_enabled: hasContext,
            docs_count: knowledgeBaseFiles.length,
            model: model.model
        };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI:', err);
        res.status(500).json({ error: 'Erro ao processar solicitação de IA' });
    }
});

// 2. Analyze Inventory Demand (Predictive AI - Sales + Future Schedule)
app.get('/api/ai/inventory-forecast', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    try {
        // 1. Dados Históricos (Vendas últimos 30 dias)
        const salesData = await pool.query(`
            SELECT p.name, p.stock_quantity, p.min_stock_level, COUNT(si.id) as sales_velocity
            FROM products p
            LEFT JOIN sale_items si ON p.id = si.product_id
            LEFT JOIN sales s ON si.sale_id = s.id
            WHERE s.sale_date > NOW() - INTERVAL '30 days' OR s.sale_date IS NULL
            GROUP BY p.id, p.name, p.stock_quantity, p.min_stock_level
        `);

        // 2. Demanda Futura (Agendamentos próximos 7 dias)
        // Isso permite que a IA preveja consumo baseado no que VAI acontecer
        const futureDemand = await pool.query(`
            SELECT type, COUNT(*) as count 
            FROM appointments 
            WHERE appointment_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
            GROUP BY type
        `);

        const context = {
            current_stock: salesData.rows,
            upcoming_schedule_7days: futureDemand.rows
        };

        const prompt = `
            Atue como um Gerente de Supply Chain Veterinário Sênior.
            Analise o cruzamento entre o ESTOQUE ATUAL e a DEMANDA FUTURA (Agendamentos da semana).

            DADOS:
            ${JSON.stringify(context)}

            REGRAS DE NEGÓCIO:
            - Cirurgias consomem muito material (anestésicos, luvas, fios).
            - Consultas consomem itens básicos (vacinas, vermífugos).
            - Se o estoque for baixo e houver alta demanda futura desse tipo de serviço, gere um ALERTA CRÍTICO.

            SAÍDA ESPERADA (JSON):
            {
                "analysis_summary": "Resumo executivo da situação de estoque vs agenda.",
                "critical_restock": [
                    { "item": "Nome sugerido do item (ex: Kit Cirúrgico)", "reason": "5 Cirurgias agendadas e estoque baixo de correlatos", "suggested_qty": 10 }
                ],
                "waste_alert": "Algum item com estoque muito alto e pouca saída?"
            }
        `;
        
        console.time('VertexAI-InventoryForecast');
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.timeEnd('VertexAI-InventoryForecast');

        const jsonResponse = parseAIJSON(text) || { analysis_summary: 'Erro ao processar IA (Formato inválido)' };

        res.json(jsonResponse);

    } catch (err) {
        console.error('Erro na Vertex AI (Inventory):', err);
        res.status(500).json({ error: 'Erro ao gerar previsão de estoque' });
    }
});

// 2.1 Smart Campaigns (CRM Ativo - Retention)
app.get('/api/ai/smart-campaigns', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    // Get user instruction from query params (if any)
    const { userInstruction } = req.query;

    try {
        console.time('VertexAI-SmartCampaigns'); // Start Timer
        // Busca pets que não visitam a clínica há mais de 6 meses (Risco de Churn)
        // E cruza com a idade para campanhas específicas (ex: Geriatria)
        // TODO: In a real scenario, this query should be dynamic based on the user instruction if possible
        const inactivePets = await pool.query(`
            SELECT p.name, p.species, p.breed, p.birth_date, t.name as tutor_name
            FROM pets p
            JOIN tutors t ON p.tutor_id = t.id
            WHERE p.id NOT IN (
                SELECT pet_id FROM appointments WHERE appointment_date > NOW() - INTERVAL '6 months'
            )
            LIMIT 20; 
        `);

        let prompt;

        if (userInstruction && userInstruction.trim() !== '') {
            // --- MODE 1: User Directed Campaign ---
            prompt = `
                Atue como um Especialista em Marketing Veterinário.
                O usuário (Veterinário/Gestor) solicitou criar uma campanha específica.
                
                OBJETIVO DO USUÁRIO: "${userInstruction}"

                DADOS DISPONÍVEIS (Amostra de pacientes):
                ${JSON.stringify(inactivePets.rows)}

                TAREFA:
                1. Analise o objetivo do usuário.
                2. Identifique qual segmento da base de dados (mesmo que hipoteticamente, se os dados acima não forem suficientes) seria o alvo ideal.
                3. Crie o conteúdo da campanha focado nesse objetivo.

                SAÍDA ESPERADA (JSON):
                {
                    "campaign_name": "Nome da Campanha (Baseado no objetivo)",
                    "target_segments": [
                        {
                            "segment": "Público Alvo Sugerido",
                            "rationale": "Por que esse público se encaixa no objetivo do usuário.",
                            "whatsapp_message": "Texto da mensagem persuasiva para WhatsApp.",
                            "suggested_discount": "Sugestão de oferta (se aplicável)"
                        }
                    ],
                    "estimated_revenue_impact": "Alta/Média/Baixa"
                }
            `;
        } else {
            // --- MODE 2: AI Proactive Discovery (Default) ---
            prompt = `
                Atue como um Especialista em Marketing Veterinário e Retenção de Clientes.
                Temos uma lista de pacientes "sumidos" (sem visitas há 6 meses).
                
                DADOS DOS PACIENTES:
                ${JSON.stringify(inactivePets.rows)}

                TAREFA:
                1. Segmente esses pacientes (ex: Cães Idosos, Gatos Adultos).
                2. Crie uma "Campanha Relâmpago" para trazer eles de volta.
                3. Gere o texto da mensagem (curto, para WhatsApp) personalizado para cada segmento.

                SAÍDA ESPERADA (JSON):
                {
                    "campaign_name": "Nome criativo da campanha",
                    "target_segments": [
                        {
                            "segment": "Cães Idosos (+7 anos)",
                            "rationale": "Precisam de checkup cardíaco/renal anual.",
                            "whatsapp_message": "Olá [Nome Tutor]! Faz tempo que não vemos o [Nome Pet]. Nessa fase da vida, o check-up preventivo é vital. Vamos agendar?",
                            "suggested_discount": "10% no Check-up Geriátrico"
                        }
                    ],
                    "estimated_revenue_impact": "Estimativa qualitativa (Alta/Média/Baixa)"
                }
            `;
        }

        console.log(`📢 Gerando Campanha Inteligente (Mode: ${userInstruction ? 'User Directed' : 'Auto'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        
        console.time('VertexAI-SmartCampaigns');
        const result = await generateContentWithRetry(generativeModel, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.timeEnd('VertexAI-SmartCampaigns');

        const jsonResponse = parseAIJSON(text) || { campaign_name: 'Erro ao gerar campanha', target_segments: [] };

        res.json(jsonResponse);

    } catch (err) {
        console.error('Erro na Vertex AI (Campaigns):', err);
        res.status(500).json({ error: 'Erro ao gerar campanhas inteligentes' });
    }
});

// 4. Hospitalization Smart Round (Predictive Trend Analysis)
app.post('/api/ai/hospitalization-round', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { patients } = req.body; // Array of patients with vitals history

    const prompt = `
        Atue como um Especialista em Terapia Intensiva Veterinária.
        Analise os pacientes internados, focando na EVOLUÇÃO TEMPORAL dos sinais vitais (Tendências).

        DADOS DOS PACIENTES:
        ${JSON.stringify(patients)}

        TAREFA:
        1. Para cada paciente, compare os sinais vitais atuais com os anteriores.
        2. Identifique padrões de deterioração (ex: Tríade da Sepse, Desidratação progressiva).
        3. Gere um "Score de Risco" (1-10) e ações imediatas.

        SAÍDA ESPERADA (JSON):
        {
            "summary": "Visão geral do plantão (ex: 'Plantão estável, atenção ao Box 2').",
            "critical_alerts": [
                {
                    "name": "Rex",
                    "bay": "Box 1",
                    "reason": "FC subindo (100->140) + Pressão caindo. Sinais de Choque."
                }
            ],
            "suggestions": [
                "Rex: Avaliar lactato e considerar bolus de fluido.",
                "Geral: Monitorar temperatura de todos os pacientes."
            ]
        }
    `;

    try {
        console.log(`🏥 Iniciando Ronda Inteligente (Model: ${process.env.GOOGLE_VERTEX_MODEL || 'default'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        
        console.time('VertexAI-Round');
        const result = await generateContentWithRetry(generativeModel, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.timeEnd('VertexAI-Round');

        const jsonResponse = parseAIJSON(text) || {
            summary: 'Erro na análise (Formato inválido ou resposta vazia)',
            critical_alerts: [],
            suggestions: []
        };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Round):', err);
        res.status(500).json({
            error: `Erro ao processar ronda inteligente: ${err.message}`,
            details: err.message,
            code: err.code
        });
    }
});

// 5. Financial Insights (Revenue Leakage Detection - "The Auditor")
app.get('/api/financial/dashboard', authenticateToken, async (req, res) => {
    try {
        // 1. Cash Flow (Last 7 Days)
        // Get sales (revenue) and cost of goods sold (expenses) for the last 7 days
        const cashFlowRes = await pool.query(`
            SELECT 
                TO_CHAR(s.sale_date, 'Dy') as name,
                SUM(s.total_amount) as entradas,
                SUM(COALESCE(si.quantity * p.cost_price, 0)) as saidas
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            LEFT JOIN products p ON si.product_id = p.id
            WHERE s.sale_date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY TO_CHAR(s.sale_date, 'Dy'), DATE(s.sale_date)
            ORDER BY DATE(s.sale_date) ASC
        `);

        // If no data, return empty or zeroed structure could be handled by frontend, 
        // but let's ensure we return at least what we found.
        
        // 2. DRE (Simulated for this period)
        // Total Revenue
        const revenueRes = await pool.query(`
            SELECT SUM(total_amount) as total FROM sales WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        const totalRevenue = parseFloat(revenueRes.rows[0].total || 0);
        
        // Total Costs (COGS)
        const costRes = await pool.query(`
            SELECT SUM(si.quantity * p.cost_price) as total 
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN products p ON si.product_id = p.id
            WHERE s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
        `);
        const totalCosts = parseFloat(costRes.rows[0].total || 0);
        
        // Fixed Expenses (Simulated/Placeholder as we don't have an expenses table yet)
        const fixedExpenses = 15000; // Rent, Energy, Internet, etc.
        
        const dre = [
            { name: 'Receita Bruta', value: totalRevenue, color: '#10b981' },
            { name: 'Custos Variáveis', value: totalCosts, color: '#f59e0b' },
            { name: 'Despesas Fixas', value: fixedExpenses, color: '#ef4444' },
            { name: 'Lucro Líquido', value: totalRevenue - totalCosts - fixedExpenses, color: '#3b82f6' },
        ];

        // 3. Commissions (By Vet/User)
        // Assuming 10% commission on services (not products), or just flat 5% on total sales for simplicity
        const commissionsRes = await pool.query(`
            SELECT u.name, SUM(s.total_amount) * 0.10 as valor
            FROM sales s
            JOIN users u ON s.user_id = u.id
            WHERE s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY u.name
            ORDER BY valor DESC
            LIMIT 5
        `);

        res.json({
            cashFlow: cashFlowRes.rows,
            dre,
            commissions: commissionsRes.rows
        });

    } catch (err) {
        console.error('Erro ao buscar dashboard financeiro:', err);
        res.status(500).json({ error: 'Erro ao carregar dados financeiros' });
    }
});

app.get('/api/ai/financial-insights', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    try {
        // Simulação de Cruzamento: Prontuários do dia vs Vendas do dia
        // Na vida real, faríamos JOIN entre appointments/clinical_notes e sales
        const todayOperations = await pool.query(`
            SELECT a.id, a.reason, p.name as pet, a.status 
            FROM appointments a 
            JOIN pets p ON a.pet_id = p.id
            WHERE a.appointment_date::date = CURRENT_DATE AND a.status = 'concluido'
        `);

        const todaySales = await pool.query(`
            SELECT s.total_amount, s.payment_method, si.product_id 
            FROM sales s
            LEFT JOIN sale_items si ON s.id = si.sale_id
            WHERE s.sale_date::date = CURRENT_DATE
        `);

        const context = {
            clinical_activity: todayOperations.rows, // O que foi feito (ex: "Consulta + Vacina")
            billed_items: todaySales.rows // O que foi cobrado
        };

        const prompt = `
            Atue como um Auditor Financeiro Clínico.
            Cruze a atividade clínica realizada hoje com o que foi efetivamente faturado para encontrar "Revenue Leakage" (Receita Perdida).

            DADOS:
            ${JSON.stringify(context)}

            REGRAS DE AUDITORIA:
            1. Se houve "Consulta" ou "Vacina" na atividade clínica, deve haver uma venda correspondente.
            2. Estime o valor perdido se houver discrepância.

            SAÍDA ESPERADA (JSON):
            {
                "revenue_health": "Saudável" ou "Atenção - Perdas Detectadas",
                "leakage_alerts": [
                    {
                        "description": "Paciente 'Thor' veio para Vacina V10 mas não consta venda de vacina.",
                        "estimated_loss": "R$ 120,00",
                        "action": "Verificar com Vet. João"
                    }
                ],
                "financial_forecast": "Projeção simples baseada no volume do dia."
            }
        `;

        console.log(`💰 Iniciando Auditoria Financeira (Model: ${process.env.GOOGLE_VERTEX_MODEL || 'default'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        
        console.time('VertexAI-FinancialInsights');
        const result = await generateContentWithRetry(generativeModel, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.timeEnd('VertexAI-FinancialInsights');

        const jsonResponse = parseAIJSON(text) || { insights: ['Sem dados suficientes ou erro de formato'] };

        res.json(jsonResponse);

    } catch (err) {
        console.error('Erro na Vertex AI (Financeiro):', err);
        res.status(500).json({ error: 'Erro ao gerar insights financeiros' });
    }
});

// 6. Clinical Note Structuring (Auto-Coding & Billing Suggestions & Owner Instructions)
app.post('/api/ai/structure-clinical-notes', authenticateToken, async (req, res) => {
    // Use Flash model for speed and higher quota, fallback to Pro if needed
    const modelToUse = generativeModelFlash || generativeModel;

    if (!modelToUse) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { pet, history, rawNotes } = req.body;

    const prompt = `
        Atue como um Assistente Veterinário Sênior e Especialista em Comunicação.
        Transforme as anotações soltas (ditadas ou digitadas) em um registro clínico completo.

        ANOTAÇÕES BRUTAS: "${rawNotes}"
        HISTÓRICO: "${history || ''}"
        PET: ${JSON.stringify(pet)}

        TAREFA:
        1. Estruture em SOAP (Subjetivo, Objetivo, Avaliação, Plano).
        2. Identifique procedimentos para faturamento.
        3. Gere uma PRESCRIÇÃO sugerida (se aplicável).
        4. Escreva INSTRUÇÕES PARA O TUTOR (Linguagem simples, empática, formatada para WhatsApp).

        SAÍDA ESPERADA (JSON):
        {
            "diagnosis": "Hipótese diagnóstica principal (Resumo)",
            "treatment": "Plano terapêutico sugerido (Resumo)",
            "structured_soap": {
                "s": "...",
                "o": "...",
                "a": "...",
                "p": "..."
            },
            "suggested_billing": [
                { "item": "Nome do Procedimento", "confidence": "High/Medium", "reason": "Justificativa" }
            ],
            "prescription": [
                { "medication": "Nome", "dosage": "Dose", "frequency": "Frequência", "duration": "Duração" }
            ],
            "owner_instructions": {
                "title": "Cuidados em Casa com [Nome do Pet]",
                "text": "Olá! Aqui estão os cuidados...\n\n1. Medicação...\n2. Observar...",
                "whatsapp_format": "*Cuidados com [Nome do Pet]* 🐾\n\nOlá! Seguem as orientações..."
            },
            "follow_up_suggestion": "Retorno em X dias."
        }
    `;

    try {
        console.log(`📝 Estruturando Notas Clínicas (Model: ${process.env.GOOGLE_VERTEX_MODEL || 'default'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        
        console.time('VertexAI-ClinicalNotes');
        const result = await generateContentWithRetry(modelToUse, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        console.timeEnd('VertexAI-ClinicalNotes');

        const jsonResponse = parseAIJSON(text) || {
            diagnosis: "Não foi possível gerar o diagnóstico (Erro de formato)",
            treatment: "Tente novamente",
            structured_soap: {
                s: rawNotes,
                o: "Não identificado",
                a: "Não identificado",
                p: "Não identificado"
            },
            suggested_billing: [],
            prescription: [],
            owner_instructions: { title: "Erro", text: "Não foi possível gerar instruções." }
        };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Notes):', err);
        // Better error message for frontend
        const errorMessage = err.message?.includes('429') || err.status === 'RESOURCE_EXHAUSTED'
            ? 'Cota de IA excedida. Tente novamente em alguns instantes.'
            : 'Erro ao estruturar notas com IA.';

        res.status(500).json({ error: errorMessage, details: err.message });
    }
});

// 8. AI Vision Analysis (Simulated for Demo)
app.post('/api/ai/analyze-image', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { imageType, description, simulatedFinding } = req.body;

    // In a real scenario, we would send the image bytes to Vertex AI Vision.
    // Here we simulate the analysis based on the description to demonstrate the workflow.

    const prompt = `
        Atue como um Especialista em Radiologia e Dermatologia Veterinária.
        Analise a seguinte descrição de uma imagem diagnóstica (Simulando visão computacional):
        
        TIPO DE IMAGEM: ${imageType} (Ex: Raio-X, Ultrassom, Foto Dermatológica)
        DESCRIÇÃO VISUAL: ${description}
        SUSPEITA CLÍNICA: ${simulatedFinding || 'Análise exploratória'}

        TAREFA:
        1. Descreva os achados técnicos detalhados (como se estivesse vendo a imagem).
        2. Sugira um diagnóstico diferencial.
        3. Indique o grau de urgência (1-10).

        SAÍDA ESPERADA (JSON):
        {
            "technical_findings": "Observa-se opacidade difusa em lobo pulmonar...",
            "diagnosis": ["Pneumonia Aspirativa", "Edema Pulmonar"],
            "confidence": "85%",
            "urgency_score": 8,
            "recommendation": "Realizar hemograma e iniciar antibioticoterapia."
        }
    `;

    try {
        console.log(`👁️ Analisando Imagem (Model: ${process.env.GOOGLE_VERTEX_MODEL || 'default'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        const result = await generateContentWithRetry(generativeModel, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        const jsonResponse = parseAIJSON(text) || { technical_findings: "Erro na análise." };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Vision):', err);
        res.status(500).json({ error: 'Erro ao analisar imagem' });
    }
});

// 7. Preventive Care Plan (Vertex AI)
app.post('/api/ai/care-plan', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { species, breed, age } = req.body;

    const prompt = `
        Atue como um Veterinário Preventivo. Crie um plano de cuidados preventivos de 12 meses para:
        Espécie: ${species}, Raça: ${breed}, Idade: ${age} anos.
        
        Inclua vacinas, vermífugos e exames de rotina.
        Retorne um JSON array onde cada item tem:
        - description (ex: "Vacina V10")
        - monthOffset (0 a 11, onde 0 é agora)
        - type (vacina, exame, vermifugo, prevencao)
    `;

    try {
        console.log(`🛡️ Gerando Plano Preventivo (Model: ${process.env.GOOGLE_VERTEX_MODEL || 'default'})...`);
        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        };
        const result = await generateContentWithRetry(generativeModel, request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;

        const jsonResponse = parseAIJSON(text) || [];
        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Care Plan):', err);
        res.status(500).json({ error: 'Erro ao gerar plano preventivo' });
    }
});

// Vercel Serverless Check
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`🚀 Servidor rodando na porta ${port}`);
    });
}

export default app;
