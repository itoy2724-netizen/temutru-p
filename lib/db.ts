import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     'mysql-1ff48a92-itoy2724-d356.d.aivencloud.com',
  user:     'avnadmin',
  password: 'AVNS_00WbvIaMHC0gqEbkojK',
  database: 'defaultdb',
  port:     18217,
  ssl:      { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;