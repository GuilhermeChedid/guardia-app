const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = require('../../db');

const email = process.env.ADMIN_EMAIL || 'admin@guardia.local';
const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
const pin = process.env.ADMIN_PROOF_PIN || '1234';

async function createAdmin() {
    const client = await pool.connect();
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const pinHash = await bcrypt.hash(pin, 10);
        await client.query('BEGIN');

        const userResult = await client.query(
            `INSERT INTO usuarios
                (nome, cpf, estado_civil, telefone, email, is_admin, termos_aceitos)
             VALUES ($1, $2, $3, $4, $5, TRUE, TRUE)
             ON CONFLICT (email) DO UPDATE SET is_admin = TRUE
             RETURNING id, nome, email, is_admin`,
            ['Administrador Guardiã', '00000000000', 'Prefiro não informar', '00000000000', email]
        );
        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO seguranca (usuario_id, senha, pin_provas)
             VALUES ($1, $2, $3)
             ON CONFLICT (usuario_id) DO UPDATE SET senha = EXCLUDED.senha, pin_provas = EXCLUDED.pin_provas`,
            [user.id, passwordHash, pinHash]
        );

        await client.query(
            `INSERT INTO endereco (usuario_id, cep, logradouro, numero, bairro, cidade, estado_uf)
             VALUES ($1, '00000000', 'Endereço administrativo', '0', 'Centro', 'São Paulo', 'SP')
             ON CONFLICT (usuario_id) DO NOTHING`,
            [user.id]
        );

        await client.query('COMMIT');
        console.log(`Conta administrativa pronta: ${user.email}`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createAdmin().catch((error) => {
    console.error('Erro ao criar conta administrativa:', error);
    process.exitCode = 1;
});
