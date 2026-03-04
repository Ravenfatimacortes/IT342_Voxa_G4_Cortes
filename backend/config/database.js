const { Sequelize } = require('sequelize');
const mysql = require('mysql2');

const sequelize = new Sequelize('voxa', 'root', '', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false,
  dialectModule: mysql,
  // Performance optimizations
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    // Enable query cache
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  // Disable unnecessary features for performance
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  // Query optimization
  query: {
    raw: false
  },
  // Connection timeout
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ENOTFOUND/
    ],
    max: 3
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('XAMPP MySQL Connected: localhost:3306');
    return sequelize;
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('WARNING: Could not connect to MySQL. Please ensure XAMPP MySQL is running!');
    console.log('Continuing without database connection for testing...');
    // Don't exit, just return sequelize for later attempts
    return sequelize;
  }
};

module.exports = { sequelize, connectDB };
