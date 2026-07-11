import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     'mysql-1ff48a92-itoy2724-d356.d.aivencloud.com',
  user:     'avnadmin',
  password: 'AVNS_00WbvIaMHC0gqEbkojK',
  database: 'defaultdb',
  port:     18217,
  ssl:      { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 3, // Serverless instance başına 3 bağlantı (limit aşımını ve şişmeyi önler)
  queueLimit: 0,
  enableKeepAlive: true, // TCP Keep-Alive'ı etkinleştir
  keepAliveInitialDelay: 10000, // 10 saniye sonra keep-alive paketleri gönder
  idleTimeout: 30000, // 30 saniye boyunca kullanılmayan boş bağlantıları havuzdan temizle (zombie connection önleme)
});

export default pool;