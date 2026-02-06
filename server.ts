import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import app from './backend/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env loader for production/Amplify
const loadEnv = (file: string) => {
    const p = path.resolve(process.cwd(), file);
    if (fs.existsSync(p)) {
        console.log(`Loading env from ${file}`);
        const content = fs.readFileSync(p, 'utf-8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
            if (m) {
                const k = m[1];
                let v = m[2].trim();
                if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")) || (v.startsWith('`') && v.endsWith('`'))) {
                    v = v.slice(1, -1);
                }
                if (!process.env[k]) process.env[k] = v;
            }
        }
    }
};

loadEnv('.env');
loadEnv('.env.local');

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, 'client')));

// SPA fallback: serve index.html for any unknown routes (non-API)
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
});
