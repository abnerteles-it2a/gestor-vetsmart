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

// Carrega variáveis de ambiente. .env.local tem precedência sobre .env (se carregado primeiro, pois dotenv não sobrescreve)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-vetsmart';

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
    let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    // Remove potential backticks wrapping the JSON
    if (credentialsJson.startsWith('`') && credentialsJson.endsWith('`')) {
      credentialsJson = credentialsJson.slice(1, -1);
    }
    
    const credentialsPath = path.resolve(__dirname, 'google-credentials.json');
    fs.writeFileSync(credentialsPath, credentialsJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log('🔑 Credenciais do Google Cloud configuradas via GOOGLE_CREDENTIALS_JSON');
  }

  // Configuração usando credenciais do ambiente ou ADC (Application Default Credentials)
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';
  const modelName = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.5-flash'; // Modelo padrão
  const flashModelName = 'gemini-2.5-flash'; // Optimized for long context (RAG)

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
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
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

// Helper function to robustly parse JSON from AI response
function parseAIJSON(text) {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find the first '{' or '[' and the last '}' or ']'
        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        
        let start = -1;
        let end = -1;
        let isArray = false;

        // Determine if we are looking for an object or array
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            start = firstBrace;
            end = cleanText.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            start = firstBracket;
            end = cleanText.lastIndexOf(']');
            isArray = true;
        }

        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
            return JSON.parse(cleanText);
        }
        
        // Fallback: try parsing the original text directly
        return JSON.parse(text);
    } catch (e) {
        console.error('Erro ao fazer parse do JSON da IA:', e);
        return null; // Return null to indicate failure
    }
}

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
        console.error(err);
        res.status(500).json({ error: 'Erro no login' });
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
            SELECT a.*, p.name as pet_name, p.species, t.name as tutor_name, u.name as vet_name
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
    const { pet_id, vet_id, appointment_date, type, reason } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO appointments (pet_id, vet_id, appointment_date, type, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [pet_id, vet_id, appointment_date, type, reason]
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
        O plano deve conter:
        1. Possíveis diagnósticos diferenciais (liste 3)
        2. Exames sugeridos
        3. Tratamento sintomático inicial recomendado (Cite protocolos dos docs se aplicável)
        4. Sinais de alerta para retorno imediato

        Responda em formato JSON estruturado.
    `;

    try {
        const request = {
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    ...knowledgeBaseFiles // Attach GCS files as multimodal input
                ]
            }]
        };

        const result = await model.generateContent(request);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        // Tenta extrair JSON se o modelo retornar markdown
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_text: text };

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

// 2. Analyze Inventory Demand (Real AI)
app.get('/api/ai/inventory-forecast', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    try {
        // Busca produtos e suas vendas nos últimos 30 dias
        const result = await pool.query(`
            SELECT p.id, p.name, p.stock_quantity, p.min_stock_level, 
                   COUNT(si.id) as sales_count
            FROM products p
            LEFT JOIN sale_items si ON p.id = si.product_id
            LEFT JOIN sales s ON si.sale_id = s.id
            WHERE s.sale_date > NOW() - INTERVAL '30 days' OR s.sale_date IS NULL
            GROUP BY p.id
        `);
        
        const inventoryData = result.rows;

        const prompt = `
            Atue como um gerente de estoque veterinário. Analise os seguintes dados de produtos (estoque atual, mínimo e vendas nos últimos 30 dias):
            ${JSON.stringify(inventoryData)}

            Identifique quais produtos precisam de reposição urgente ou atenção.
            Retorne um JSON com uma lista de 'predictions', onde cada item tem:
            - productId
            - name
            - suggestedStock (quanto comprar)
            - reason (curta explicação)
            
            Se o estoque estiver saudável, retorne uma lista vazia.
        `;

        const aiResult = await generativeModel.generateContent(prompt);
        const response = await aiResult.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { predictions: [] };

        res.json(jsonResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao analisar estoque' });
    }
});

// 3. Smart Campaigns (Vertex AI)
app.get('/api/ai/smart-campaigns', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    try {
        // Busca estatísticas de pets para inspirar campanhas
        const result = await pool.query(`
            SELECT species, 
                   CASE 
                       WHEN extract(year from age(birth_date)) >= 7 THEN 'senior'
                       WHEN extract(year from age(birth_date)) < 1 THEN 'puppy'
                       ELSE 'adult'
                   END as age_group,
                   COUNT(*) as count
            FROM pets
            GROUP BY species, age_group
            ORDER BY count DESC
            LIMIT 5
        `);
        
        const stats = result.rows;

        const prompt = `
            Atue como um especialista em Marketing Veterinário. Com base nestes dados demográficos dos pacientes da clínica:
            ${JSON.stringify(stats)}

            Crie 3 ideias de campanhas de marketing (email/whatsapp) altamente eficazes.
            Retorne JSON com lista de 'campaigns', contendo:
            - title
            - target_audience
            - message_brief (resumo da mensagem)
            - estimated_conversion (estimativa %)
        `;

        const aiResult = await generativeModel.generateContent(prompt);
        const response = await aiResult.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { campaigns: [] };

        res.json(jsonResponse);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar campanhas' });
    }
});

// 4. Hospitalization Smart Round (Vertex AI)
app.post('/api/ai/hospitalization-round', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    const { patients } = req.body; // Array of patients in hospitalization

    const prompt = `
        Atue como um Chefe de Internação Veterinária. Analise a lista de pacientes internados abaixo e gere um relatório de ronda ("Smart Round"):
        ${JSON.stringify(patients)}

        Para cada paciente, identifique se há riscos críticos com base no status e razão da internação.
        Retorne um JSON com:
        - summary (string: resumo geral da internação)
        - critical_alerts (array de strings: descreva o paciente e o risco em formato de texto. Ex: "Rex (Box 1): Risco de infecção")
        - suggestions (array de strings: sugestões gerais para a equipe de enfermagem)
    `;

    try {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonResponse = parseAIJSON(text) || { summary: 'Sem dados', critical_alerts: [], suggestions: [] };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI:', err);
        res.status(500).json({ error: 'Erro ao processar ronda inteligente' });
    }
});

// 5. Financial Insights (Vertex AI)
app.get('/api/ai/financial-insights', authenticateToken, async (req, res) => {
    if (!generativeModel) {
        return res.status(503).json({ error: 'Serviço de IA não disponível.' });
    }

    try {
        // Fetch real sales data (last 30 days vs previous 30 days could be better, but simplified for now)
        const salesRes = await pool.query(`
            SELECT DATE(sale_date) as date, SUM(total_amount) as total 
            FROM sales 
            WHERE sale_date > NOW() - INTERVAL '30 days' 
            GROUP BY date 
            ORDER BY date ASC
        `);
        
        // Mock expenses for now as we don't have an expenses table populated yet
        const expensesMock = {
            fixed: 30000,
            variable: salesRes.rows.reduce((acc, row) => acc + (row.total * 0.4), 0) // Assume 40% cost
        };

        const financialData = {
            daily_sales: salesRes.rows,
            expenses: expensesMock
        };

        const prompt = `
            Atue como um CFO (Chief Financial Officer) para esta clínica veterinária. Analise os dados financeiros dos últimos 30 dias:
            ${JSON.stringify(financialData)}

            Gere insights estratégicos.
            Retorne um JSON com:
            - revenue_trend (tendência de receita: 'crescimento', 'estável', 'queda')
            - insights (lista de strings com observações importantes)
            - recommendations (lista de ações recomendadas para aumentar lucro ou reduzir custos)
            - projected_revenue (previsão para o próximo mês)
        `;

        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: ['Sem dados suficientes'] };

        res.json(jsonResponse);

    } catch (err) {
        console.error('Erro na Vertex AI (Financeiro):', err);
        res.status(500).json({ error: 'Erro ao gerar insights financeiros' });
    }
});

// 6. Clinical Note Structuring (Vertex AI)
app.post('/api/ai/structure-clinical-notes', authenticateToken, async (req, res) => {
    // Debug: Log para ver se entrou na rota e o estado do modelo
    console.log('Recebida requisição em /api/ai/structure-clinical-notes');
    
    if (!generativeModel) {
        console.error('Erro 503: generativeModel é null. Verifique as credenciais do GCP.');
        return res.status(503).json({ error: 'Serviço de IA não disponível. Verifique as configurações do servidor.' });
    }

    const { pet, history, rawNotes } = req.body;
    
    console.log('--- AI Request Debug ---');
    console.log('Pet:', JSON.stringify(pet));
    console.log('Raw Notes:', rawNotes);
    console.log('------------------------');

    const prompt = `
        Atue como um Assistente Veterinário Sênior. Transforme as anotações rascunhadas abaixo em um prontuário médico profissional (SOAP).
        
        DADOS DO PACIENTE:
        Espécie: ${pet.species}, Raça: ${pet.breed}, Idade: ${pet.age}
        
        HISTÓRICO RECENTE:
        ${history}
        
        ANOTAÇÕES RASCUNHADAS (RAW):
        "${rawNotes}"

        IMPORTANTE - REGRAS DE PRIORIDADE DE DIAGNÓSTICO:
        1. O campo "Diagnóstico Preliminar" dentro das notas pode conter dados antigos ou incorretos.
        2. Sua prioridade MÁXIMA é analisar a "Anamnese" e "Exame Físico".
        3. Se a "Anamnese" relatar sintomas (ex: vômito, diarreia) que contradizem o "Diagnóstico Preliminar" (ex: dermatite), IGNORE o diagnóstico preliminar e gere um novo baseado nos sintomas.
        4. Baseie-se ESTRITAMENTE nos sintomas relatados.
        5. Se as anotações estiverem vazias, retorne "Aguardando avaliação clínica".

        Retorne JSON estritamente com esta estrutura:
        {
          "formattedNotes": "Texto completo formatado e profissional (SOAP)",
          "hypotheses": ["Hipotese 1", "Hipotese 2"],
          "suggestedExams": ["Exame 1", "Exame 2"],
          "ownerInstructions": "Instruções claras para o tutor",
          "diagnosis": "Diagnóstico principal sugerido (baseado APENAS nas notas)",
          "treatment": "Protocolo de tratamento sugerido"
        }
    `;

    try {
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonResponse = parseAIJSON(text) || { formattedNotes: rawNotes, diagnosis: "Erro ao processar IA", treatment: "Verificar manualmente" };

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Prontuário):', err);
        res.status(500).json({ error: 'Erro ao estruturar prontuário' });
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
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const jsonMatch = text.match(/\[[\s\S]*\]/); // Match array
        const jsonResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        res.json(jsonResponse);
    } catch (err) {
        console.error('Erro na Vertex AI (Plano):', err);
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
