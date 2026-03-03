const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS voxa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('Database "voxa" created or already exists');

    // Close connection
    await connection.end();
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
