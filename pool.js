const pool = require('./dbconnect'); // Import your MySQL connection pool from db.js

// Function to execute an SQL query using a connection from the pool
async function executeQuery(sql, params) {
  let connection;
  try {
    // Acquire a connection from the pool
    connection = await pool.getConnection();

    // Execute the SQL query with optional parameters
    const [results] = await connection.query(sql, params);

    return results;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
}

module.exports = { executeQuery };
