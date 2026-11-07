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
        await pool.query(`
            CREATE TABLE IF NOT EXISTS historico_evidencias (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                evidencia_id UUID,
                usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                acao VARCHAR(20) NOT NULL,
                data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Estrutura de evidências pronta.');
    } finally {
        await pool.end();
    }
};

migrate().catch((error) => {
    console.error('Não foi possível atualizar a tabela de evidências:', error);
    process.exitCode = 1;
});
