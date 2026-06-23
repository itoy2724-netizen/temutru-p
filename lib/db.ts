const pool = mysql.createPool({
  host:     process.env.DATABASE_HOST     || '102.220.160.109',
  user:     process.env.DATABASE_USER     || 'dimitri',
  password: process.env.DATABASE_PASSWORD || 'Losete00*',
  database: process.env.DATABASE_NAME     || 'dimitri',
  port:     Number(process.env.DATABASE_PORT) || 3306,
  ssl: false,  // Plesk local bağlantıda SSL gerekmez
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});