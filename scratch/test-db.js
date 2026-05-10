import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]);
  try {
    const res = await pool.query('SELECT NOW(), current_database()');
    console.log('✅ Connection successful!');
    console.log('Time:', res.rows[0].now);
    console.log('Database:', res.rows[0].current_database);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables found:', tables.rows.map(t => t.table_name).join(', '));
    
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
