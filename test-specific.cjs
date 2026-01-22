const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Setup Auth
if (process.env.GOOGLE_CREDENTIALS_JSON) {
    let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON.trim();
    if (credentialsJson.startsWith('`')) {
        credentialsJson = credentialsJson.replace(/^`|`$/g, '');
    }
    
    const tmpDir = os.tmpdir();
    const credentialsPath = path.join(tmpDir, 'google-credentials.json');
    fs.writeFileSync(credentialsPath, credentialsJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log(`🔑 Credentials setup at ${credentialsPath}`);
}

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'formal-audio-480723-b1';
const location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

async function testModel(modelName) {
    const vertexAI = new VertexAI({ project: projectId, location: location });
    console.log(`\n--- Testing model: ${modelName} in ${location} ---`);
    try {
        const model = vertexAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        console.log(`✅ SUCCESS: ${modelName} works!`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
        if (error.message.includes('404')) {
            console.log('   (Model not found)');
        }
        return false;
    }
}

async function run() {
    await testModel('gemini-2.0-flash-001');
    await testModel('gemini-2.5-flash');
}

run();
