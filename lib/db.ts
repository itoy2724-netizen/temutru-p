import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

function getSSL() {
  if (process.env.DATABASE_SSL_CA) {
    return { ca: process.env.DATABASE_SSL_CA };
  }
  try {
    const certPath = path.join(process.cwd(), 'sertifika.pem');
    if (fs.existsSync(certPath)) {
      return { ca: fs.readFileSync(certPath) };
    }
  } catch {}
  return { rejectUnauthorized: false };
}

const pool = mysql.createPool({
  host:     process.env.DATABASE_HOST     || '102.220.160.109',
  user:     process.env.DATABASE_USER     || 'dimitri',
  password: process.env.DATABASE_PASSWORD || 'Losete00*',
  database: process.env.DATABASE_NAME     || 'dimitri',
  port:     Number(process.env.DATABASE_PORT) || 23515,
  ssl: getSSL(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;