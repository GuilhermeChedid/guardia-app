const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    // A string de conexão vem do seu arquivo .env
    connectionString: process.env.DATABASE_URL
});

module.exports = pool;
