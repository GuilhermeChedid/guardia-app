const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = require('../db');

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE evidencias
            ADD COLUMN IF NOT EXISTS dados_criptografados TEXT
        `);
        console.log('Coluna dados_criptografados pronta.');
    } finally {
        await pool.end();
    }
};

migrate().catch((error) => {
    console.error('Não foi possível atualizar a tabela de evidências:', error);
    process.exitCode = 1;
});
