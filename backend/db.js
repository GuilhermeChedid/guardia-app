const { Pool } = require('pg');
require('dotenv').config();

let connectionString = process.env.DATABASE_URL;

if (connectionString) {
    const databaseUrl = new URL(connectionString);
    const sslMode = databaseUrl.searchParams.get('sslmode');

    if (['prefer', 'require', 'verify-ca'].includes(sslMode)) {
        databaseUrl.searchParams.set('sslmode', 'verify-full');
        connectionString = databaseUrl.toString();
    }
}

const pool = new Pool({
    connectionString
});

// Certifique-se de que está exportando o objeto pool diretamente
module.exports = pool;