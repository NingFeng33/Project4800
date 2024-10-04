// config/db.js
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    const connection = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    return connection;
}

module.exports = initializeDatabase;