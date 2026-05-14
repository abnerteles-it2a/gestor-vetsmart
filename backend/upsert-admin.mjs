/**
 * Script temporário: garante que admin@vetsmart.com existe no banco com senha 123456.
 * Executar: node backend/upsert-admin.mjs
 */
import pg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), s, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: s };
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const EMAIL = 'admin@vetsmart.com';
const PASSWORD = '123456';

const client = await pool.connect();
try {
  const { hash, salt } = hashPassword(PASSWORD);
  const result = await client.query(`
    INSERT INTO users (name, email, password_hash, password_salt, role)
    VALUES ('Dr. Ricardo Silva', $1, $2, $3, 'admin')
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          role = 'admin'
    RETURNING id, name, email, role
  `, [EMAIL, hash, salt]);
  console.log('✅ Usuário upsertado com sucesso:');
  console.table(result.rows);
} catch (e) {
  console.error('❌ Erro:', e.message);
} finally {
  client.release();
  await pool.end();
}
