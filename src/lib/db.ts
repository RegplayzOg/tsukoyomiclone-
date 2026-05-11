import 'server-only';
import mysql from 'mysql2/promise';
import { initDb } from './initDb';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25606'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'rzanime_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database schema once
initDb().catch(console.error);

export async function query(sql: string, params?: unknown[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return { rows: results };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
