/**
 * Script: Cria tabela medications e popula o bulário veterinário inicial.
 * Executar: node backend/seed-medications.mjs
 */
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const client = await pool.connect();
try {
  // Cria tabela se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS medications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      active_ingredient VARCHAR(255),
      category VARCHAR(100) DEFAULT 'Geral',
      concentration_mg_ml DECIMAL(10,4) DEFAULT 1.0,
      dosage_mg_kg_dog VARCHAR(50) DEFAULT '0',
      dosage_mg_kg_cat VARCHAR(50) DEFAULT '0',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela medications pronta.');

  // Verifica se já tem dados
  const check = await client.query('SELECT COUNT(*) FROM medications');
  if (parseInt(check.rows[0].count) > 0) {
    console.log(`ℹ️  Bulário já possui ${check.rows[0].count} medicamentos. Pulando seed.`);
  } else {
    await client.query(`
      INSERT INTO medications (name, active_ingredient, category, concentration_mg_ml, dosage_mg_kg_dog, dosage_mg_kg_cat) VALUES
      ('Amoxicilina 250mg/5ml', 'Amoxicilina Triidratada', 'Antibiótico', 50, '22', '22'),
      ('Dipirona 500mg/ml', 'Metamizol Sódico', 'Analgésico', 500, '25', '25'),
      ('Tramadol 50mg/ml', 'Tramadol HCl', 'Analgésico Opioide', 50, '4', '2'),
      ('Prednisolona 20mg', 'Prednisolona', 'Corticosteroide', 20, '1', '0.5'),
      ('Propofol 10mg/ml', 'Propofol', 'Anestésico', 10, '6', '8'),
      ('Enrofloxacino 50mg/ml', 'Enrofloxacino', 'Antibiótico', 50, '5', '2.5'),
      ('Metronidazol 400mg', 'Metronidazol', 'Antiparasitário', 400, '15', '10'),
      ('Furosemida 10mg/ml', 'Furosemida', 'Diurético', 10, '2', '1'),
      ('Enalapril 5mg', 'Enalapril Maleato', 'Cardiovascular', 5, '0.5', '0.25'),
      ('Meloxicam 2mg/ml', 'Meloxicam', 'Anti-inflamatório', 2, '0.2', '0.1'),
      ('Doxiciclina 100mg', 'Doxiciclina Hiclato', 'Antibiótico', 100, '10', '5'),
      ('Cefalexina 250mg', 'Cefalexina Mono-hidratada', 'Antibiótico', 250, '22', '22'),
      ('Omeprazol 20mg', 'Omeprazol', 'Gastroprotetor', 20, '0.7', '0.7'),
      ('Maropitant 10mg/ml', 'Maropitant', 'Antiemético', 10, '1', '1'),
      ('Dexametasona 4mg/ml', 'Dexametasona', 'Corticosteroide', 4, '0.2', '0.1')
    `);
    const total = await client.query('SELECT COUNT(*) FROM medications');
    console.log(`💊 Bulário populado com ${total.rows[0].count} medicamentos.`);
  }
} catch (e) {
  console.error('❌ Erro:', e.message);
} finally {
  client.release();
  await pool.end();
}
