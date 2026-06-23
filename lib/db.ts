import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     '102.220.160.109',
  user:     'dimitri',
  password: 'Losete00*',
  database: 'dimitri',
  port:     3306,
  ssl:      false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;