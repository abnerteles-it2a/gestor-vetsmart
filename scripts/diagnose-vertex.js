
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env.local explicitamente para teste
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`📂 Carregando variáveis de: ${envPath}`);
dotenv.config({ path: envPath });

async function runDiagnosis() {
    console.log('\n--- 🕵️ DIAGNÓSTICO DE CONEXÃO VERTEX AI ---');

    // 1. Verificação de Credenciais
    const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credsJson) {
        console.error('❌ ERRO: GOOGLE_CREDENTIALS_JSON não encontrada nas variáveis de ambiente.');
        return;
    }

    console.log(`✅ GOOGLE_CREDENTIALS_JSON encontrada (${credsJson.length} caracteres).`);

    let credentials;
    try {
        // Simula a limpeza que o server.js faz
        let cleanJson = credsJson.trim();
        if (cleanJson.startsWith('`')) cleanJson = cleanJson.slice(1, -1);
        if (cleanJson.startsWith("'")) cleanJson = cleanJson.slice(1, -1);
        
        credentials = JSON.parse(cleanJson);

        // SANITIZAÇÃO (Igual ao server.js)
        const fieldsToSanitize = ['auth_uri', 'token_uri', 'auth_provider_x509_cert_url', 'client_x509_cert_url'];
        fieldsToSanitize.forEach(field => {
            if (credentials[field] && typeof credentials[field] === 'string') {
                if (credentials[field].includes('`') || credentials[field].trim() !== credentials[field]) {
                    console.log(`⚠️  Sanitizando campo '${field}'...`);
                    credentials[field] = credentials[field].replace(/`/g, '').trim();
                }
            }
        });

        console.log('✅ JSON das credenciais é VÁLIDO e foi SANITIZADO.');
        console.log(`   Project ID no JSON: ${credentials.project_id}`);
        console.log(`   Client Email: ${credentials.client_email}`);
    } catch (e) {
        console.error('❌ ERRO CRÍTICO: JSON das credenciais é INVÁLIDO.');
        console.error('   Motivo:', e.message);
        console.error('   Dica: Verifique se a variável não foi truncada no .env ou no painel do Amplify.');
        return;
    }

    // 2. Configuração do Cliente Vertex AI
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || credentials.project_id;
    const location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';
    const modelName = 'gemini-2.0-flash-001';

    console.log(`\n⚙️  Configurando Cliente Vertex AI:`);
    console.log(`   Project: ${projectId}`);
    console.log(`   Location: ${location}`);
    console.log(`   Model: ${modelName}`);

    // Escreve arquivo temporário de credenciais (como no server.js)
    const tmpDir = os.tmpdir();
    const credentialsPath = path.join(tmpDir, 'google-credentials-test.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

    try {
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const model = vertexAI.getGenerativeModel({ model: modelName });

        // 3. Teste de Conexão e Latência
        console.log('\n🚀 Iniciando teste de geração (Ping)...');
        const start = Date.now();
        
        const result = await model.generateContent('Responda apenas com a palavra: "Conectado".');
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        
        const end = Date.now();
        const duration = (end - start) / 1000;

        console.log(`\n✅ SUCESSO! Resposta recebida da Vertex AI.`);
        console.log(`   Resposta: "${text.trim()}"`);
        console.log(`   Tempo de Resposta: ${duration.toFixed(2)}s`);

        if (duration > 5) {
            console.warn('⚠️  ALERTA: O tempo de resposta foi alto (> 5s). Pode indicar "Cold Start" ou latência de rede.');
        } else {
            console.log('⚡ Performance Excelente (< 5s).');
        }

    } catch (error) {
        console.error('\n❌ FALHA na conexão com Vertex AI:');
        console.error(error);
        if (error.message.includes('401') || error.message.includes('UNAUTHENTICATED')) {
            console.error('   -> Possível causa: Credenciais inválidas ou expiradas.');
        } else if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
            console.error('   -> Possível causa: Service Account sem permissão "Vertex AI User".');
        }
    }
}

runDiagnosis();
