
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// --- Credential Handling (Copied from server.js) ---
const credentialsPath = path.resolve(__dirname, '../google-credentials.json');

try {
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (credentialsJson.startsWith('`') && credentialsJson.endsWith('`')) {
      credentialsJson = credentialsJson.slice(1, -1);
    }
    
    // Save to backend root
    fs.writeFileSync(credentialsPath, credentialsJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log('🔑 Credentials configured from GOOGLE_CREDENTIALS_JSON');
  } else if (fs.existsSync(credentialsPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      console.log('🔑 Found existing google-credentials.json, using it.');
  } else {
      console.warn('⚠️ No credentials found (GOOGLE_CREDENTIALS_JSON env or google-credentials.json file). GCS operations may fail.');
  }
} catch (e) {
  console.error('Error setting up credentials:', e);
}
// ---------------------------------------------------

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const BUCKET_NAME = `${PROJECT_ID}-knowledge-base`; // Unique bucket name
const KNOWLEDGE_BASE_DIR = path.resolve(__dirname, '../../knowledge_base');

console.log(`📂 Knowledge Base Directory: ${KNOWLEDGE_BASE_DIR}`);

async function initKnowledgeBase() {
    if (!PROJECT_ID) {
        console.error('❌ GOOGLE_CLOUD_PROJECT not defined in .env');
        process.exit(1);
    }
    
    // ... rest of the file
    const storage = new Storage({ projectId: PROJECT_ID });

    try {
        // 1. Check/Create Bucket
        const bucket = storage.bucket(BUCKET_NAME);
        const [exists] = await bucket.exists();

        if (!exists) {
            console.log(`📦 Creating bucket: ${BUCKET_NAME}...`);
            await bucket.create({
                location: process.env.GOOGLE_VERTEX_LOCATION || 'US-CENTRAL1',
                storageClass: 'STANDARD'
            });
            console.log('✅ Bucket created successfully.');
        } else {
            console.log(`✅ Bucket ${BUCKET_NAME} already exists.`);
        }

        // 2. Upload Files
        if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
            console.log(`⚠️ Directory ${KNOWLEDGE_BASE_DIR} not found. Creating...`);
            fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
        }

        const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);
        if (files.length === 0) {
            console.log('⚠️ No files found in knowledge_base directory to upload.');
            return;
        }

        console.log(`📤 Uploading ${files.length} files to ${BUCKET_NAME}...`);

        for (const file of files) {
            const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
            if (fs.lstatSync(filePath).isFile()) {
                console.log(`   - Uploading ${file}...`);
                await bucket.upload(filePath, {
                    destination: `docs/${file}`,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                    },
                });
            }
        }

        console.log('✅ All files uploaded successfully.');
        console.log(`ℹ️  GCS URI Pattern: gs://${BUCKET_NAME}/docs/[filename]`);

    } catch (err) {
        console.error('❌ Error initializing knowledge base:', err);
    }
}

initKnowledgeBase();
