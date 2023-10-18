const mysql = require('mysql2/promise'); // Use the promise-based version

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'clinic_mngmt',
  connectionLimit: 20,
  connectTimeout: 10000,
  queueLimit: 40,
  port: 3306,
});
module.exports = pool;
