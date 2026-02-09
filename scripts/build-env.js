import fs from 'fs';

// List of variables to capture from the build environment for gestor-vetpro
const vars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLOUD_PROJECT',
    'GOOGLE_CREDENTIALS_JSON',
    'GOOGLE_VERTEX_LOCATION',
    'GOOGLE_VERTEX_MODEL',
    'GEMINI_API_KEY',
    'PORT',
    'NODE_ENV'
];

const outputPath = process.argv[2] || '.env';

console.log(`Generating ${outputPath} from environment variables...`);

let count = 0;
const content = vars
    .map(key => {
        const val = process.env[key];
        if (val === undefined) {
            console.warn(`Warning: Variable ${key} is missing in the environment.`);
            return null;
        }
        count++;
        return `${key}=${val}`;
    })
    .filter(Boolean)
    .join('\n');

fs.writeFileSync(outputPath, content);
console.log(`Successfully wrote ${count} variables to ${outputPath}.`);
