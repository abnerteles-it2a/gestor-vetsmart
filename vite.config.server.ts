import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        ssr: true,
        copyPublicDir: false,
        target: 'node20',
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
            input: 'server.ts',
            output: {
                entryFileNames: 'server.js',
                format: 'es',
            },
            external: [
                'express',
                'pg',
                'bcryptjs',
                'jsonwebtoken',
                'cors',
                'dotenv',
                '@google-cloud/vertexai',
                '@google-cloud/storage',
                '@google/genai',
                'path',
                'fs',
                'http',
                'https',
                'url',
                'crypto',
                'stream',
                'util',
                'events',
                'os'
            ]
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
