const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

const pool = require('../../../db');

const register = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nome,
            cpf,
            estado_civil,
            telefone,
            email,
            senha,
            pin_provas,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado_uf,
            termos_aceitos,
        } = req.body;

        if (termos_aceitos !== true) {
    return res.status(400).json({
        success: false,
        message: 'É necessário aceitar os Termos de Uso.',
    });
    }

        // 1. Verificar campos obrigatórios
        if (
            !nome ||
            !cpf ||
            !estado_civil ||
            !telefone ||
            !email ||
            !senha ||
            !pin_provas ||
            !cep ||
            !logradouro ||
            !numero ||
            !bairro ||
            !cidade ||
            !estado_uf
        ) {
            return res.status(400).json({
                success: false,
                message: 'Preencha todos os campos obrigatórios.',
            });
        }


        // 3. Limpar CPF e CEP
        const cpfLimpo = cpf.replace(/\D/g, '');
        const cepLimpo = cep.replace(/\D/g, '');

        // 4. Validar CPF
        if (cpfLimpo.length !== 11) {
            return res.status(400).json({
                success: false,
                message: 'CPF inválido.',
            });
        }

        // 5. Validar CEP
        if (cepLimpo.length !== 8) {
            return res.status(400).json({
                success: false,
                message: 'CEP inválido.',
            });
        }

        // 6. Validar e-mail
        const emailNormalizado = email.trim().toLowerCase();

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            emailNormalizado
        );

        if (!emailValido) {
            return res.status(400).json({
                success: false,
                message: 'E-mail inválido.',
            });
        }

        // 7. Validar senha
        const senhaValida =
            senha.length >= 8 &&
            /[A-Z]/.test(senha) &&
            /[a-z]/.test(senha) &&
            /[0-9]/.test(senha) &&
            /[^A-Za-z0-9]/.test(senha) &&
            !/\s/.test(senha);

        if (!senhaValida) {
            return res.status(400).json({
                success: false,
                message:
                    'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial, sem espaços.',
            });
        }

        // 8. Validar PIN
        if (!/^\d{4,6}$/.test(pin_provas)) {
            return res.status(400).json({
                success: false,
                message: 'O PIN deve conter apenas números.',
            });
        }

        // 9. Verificar se CPF ou e-mail já existem
        const usuarioExistente = await client.query(
            `
            SELECT id, cpf, email
            FROM usuarios
            WHERE cpf = $1 OR email = $2
            `,
            [cpfLimpo, emailNormalizado]
        );

        if (usuarioExistente.rows.length > 0) {
            const usuario = usuarioExistente.rows[0];

            if (usuario.cpf === cpfLimpo) {
                return res.status(409).json({
                    success: false,
                    message: 'Este CPF já está cadastrado.',
                });
            }

            if (usuario.email === emailNormalizado) {
                return res.status(409).json({
                    success: false,
                    message: 'Este e-mail já está cadastrado.',
                });
            }
        }

        // 10. Criar os hashes
        const senhaHash = await bcrypt.hash(senha, 10);
        const pinHash = await bcrypt.hash(pin_provas, 10);

        // 11. Iniciar transação
        await client.query('BEGIN');

        // 12. Criar usuário
        const usuarioResult = await client.query(
            `
            INSERT INTO usuarios (
                nome,
                cpf,
                estado_civil,
                telefone,
                email,
                termos_aceitos
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome, email
            `,
            [
                nome.trim(),
                cpfLimpo,
                estado_civil,
                telefone.trim(),
                emailNormalizado,
                termos_aceitos,
            ]
        );

        const usuario = usuarioResult.rows[0];

        // 13. Criar dados de segurança
        await client.query(
            `
            INSERT INTO seguranca (
                usuario_id,
                senha,
                pin_provas
            )
            VALUES ($1, $2, $3)
            `,
            [usuario.id, senhaHash, pinHash]
        );

        // 14. Criar endereço
        await client.query(
            `
            INSERT INTO endereco (
                usuario_id,
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                estado_uf
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
            [
                usuario.id,
                cepLimpo,
                logradouro.trim(),
                numero.trim(),
                complemento ? complemento.trim() : null,
                bairro.trim(),
                cidade.trim(),
                estado_uf.trim().toUpperCase(),
            ]
        );

        // 15. Confirmar transação
        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Cadastro realizado com sucesso.',
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
        });
    } catch (error) {
        // Se alguma operação falhar, desfaz tudo
        await client.query('ROLLBACK');

        console.error('Erro no cadastro:', error);

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao realizar o cadastro.',
        });
    } finally {
        // Devolve a conexão ao pool
        client.release();
    }
  
};
    const login = async (req, res) => {
        const client = await pool.connect();

        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({
                    mensagem: 'E-mail e senha são obrigatórios.',
                });
            }

            const emailNormalizado = email.trim().toLowerCase();

            const result = await client.query(
                `
                SELECT
                    u.id,
                    u.nome,
                    u.email,
                    s.senha
                FROM usuarios u
                INNER JOIN seguranca s
                    ON s.usuario_id = u.id
                WHERE LOWER(u.email) = $1
                `,
                [emailNormalizado]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    mensagem: 'E-mail ou senha inválidos.',
                });
            }

            const usuario = result.rows[0];

            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    mensagem: 'E-mail ou senha inválidos.',
                });
            }

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso.',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                },
            });

        } catch (error) {
            console.error('Erro no login:', error);

            return res.status(500).json({
                mensagem: 'Erro interno ao realizar o login.',
            });

        } finally {
            client.release();
        }
    };

module.exports = {
    register,
    login
};