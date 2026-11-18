const { Pool } = require('pg');
require('dotenv').config();

let connectionString = process.env.DATABASE_URL;
let ssl;

if (connectionString) {
    const databaseUrl = new URL(connectionString);
    const sslMode = databaseUrl.searchParams.get('sslmode');

    if (['prefer', 'require', 'verify-ca'].includes(sslMode)) {
        ssl = { rejectUnauthorized: true };
        databaseUrl.searchParams.delete('sslmode');
        connectionString = databaseUrl.toString();
    } else if (sslMode === 'verify-full') {
        ssl = { rejectUnauthorized: true };
        databaseUrl.searchParams.delete('sslmode');
        connectionString = databaseUrl.toString();
    }
}

const pool = new Pool({
    connectionString,
    ...(ssl ? { ssl } : {}),
});

// Certifique-se de que está exportando o objeto pool diretamente
module.exports = pool;