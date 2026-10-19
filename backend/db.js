const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Certifique-se de que está exportando o objeto pool diretamente
module.exports = pool;