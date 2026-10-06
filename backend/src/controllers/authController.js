const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

const pool = require('../../../db');
const { encrypt, decrypt } = require('../utils/encryption');

const blockedNameTerms = new Set([
    'apelido', 'anonimo', 'anonymous', 'fake', 'nick', 'teste', 'test',
    'usuario', 'user', 'caralho', 'cu', 'fodase', 'foder', 'merda',
    'porra', 'puta', 'puto', 'viado', 'vadia', 'vagabundo', 'idiota',
    'imbecil', 'retardado',
]);

const evidenceRules = {
    image: { extensions: ['jpg', 'jpeg', 'png'], maxBytes: 5 * 1024 * 1024, label: 'Fotos' },
    video: { extensions: ['mp4', 'mov'], maxBytes: 30 * 1024 * 1024, label: 'Vídeos' },
    audio: { extensions: ['mp3', 'wav', 'm4a'], maxBytes: 10 * 1024 * 1024, label: 'Áudios' },
    file: { extensions: ['txt'], maxBytes: 5 * 1024 * 1024, label: 'Arquivos de texto' },
};

const validateFullName = (value = '') => {
    const name = value.trim().replace(/\s+/g, ' ');
    const parts = name.split(' ');
    const normalizedParts = parts.map((part) =>
        part.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    );

    if (
        parts.length < 2 ||
        parts.some((part) => part.length < 2) ||
        !/^[A-Za-zÀ-ÿ]+(?:['-][A-Za-zÀ-ÿ]+)?(?:\s+[A-Za-zÀ-ÿ]+(?:['-][A-Za-zÀ-ÿ]+)?)+$/.test(name) ||
        normalizedParts.some((part) => blockedNameTerms.has(part))
    ) {
        return false;
    }

    return true;
};

const verifyProofPin = async (req, res) => {
const client = await pool.connect();

try {
    const { usuario_id, pin } = req.body;

    if (!usuario_id || !/^\d{4}$/.test(pin || '')) {
        return res.status(400).json({
            success: false,
            message: 'PIN inválido.',
        });
    }

    const result = await client.query(
        `
        SELECT s.pin_provas
        FROM seguranca s
        WHERE s.usuario_id = $1
        `,
        [usuario_id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado.',
        });
    }

    const pinCorreto = await bcrypt.compare(pin, result.rows[0].pin_provas);

    if (!pinCorreto) {
        return res.status(401).json({
            success: false,
            message: 'PIN incorreto.',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'PIN validado com sucesso.',
    });
} catch (error) {
    console.error('Erro ao validar PIN das provas:', error);
    return res.status(500).json({
        success: false,
        message: 'Erro interno ao validar o PIN.',
    });
} finally {
    client.release();
}
};

const getProfile = async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `
            SELECT
                u.id,
                u.nome,
                u.cpf,
                u.estado_civil,
                u.telefone,
                u.email,
                u.url_foto_perfil,
                e.cep,
                e.logradouro,
                e.numero,
                e.complemento,
                e.bairro,
                e.cidade,
                e.estado_uf,
                (
                    SELECT COUNT(*)::int
                    FROM contatos_confianca cc
                    WHERE cc.usuario_id = u.id
                ) AS contatos_count,
                (
                    SELECT COUNT(*)::int
                    FROM evidencias ev
                    WHERE ev.usuario_id = u.id
                ) AS evidencias_count
            FROM usuarios u
            LEFT JOIN endereco e ON e.usuario_id = u.id
            WHERE u.id = $1
            `,
            [req.params.usuarioId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.',
            });
        }

        return res.status(200).json({
            success: true,
            profile: result.rows[0],
        });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar o perfil.',
        });
    } finally {
        client.release();
    }
};

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

        if (!validateFullName(nome)) {
            return res.status(400).json({
                success: false,
                message: 'Informe seu nome completo, sem apelidos ou termos ofensivos.',
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
                    u.is_admin,
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
                    is_admin: usuario.is_admin,
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

const updateProfile = async (req, res) => {
    const client = await pool.connect();

    try {
        const { nome, email, telefone, estado_civil, logradouro } = req.body;
        const { usuarioId } = req.params;

        if (!nome?.trim() || !email?.trim() || !telefone?.trim() || !estado_civil?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Preencha todos os campos obrigatórios do perfil.',
            });
        }

        const emailNormalizado = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            return res.status(400).json({
                success: false,
                message: 'E-mail inválido.',
            });
        }

        await client.query('BEGIN');

        const userResult = await client.query(
            `
            UPDATE usuarios
            SET nome = $1, email = $2, telefone = $3, estado_civil = $4
            WHERE id = $5
            RETURNING id, nome, email, telefone, estado_civil
            `,
            [nome.trim(), emailNormalizado, telefone.trim(), estado_civil.trim(), usuarioId]
        );

        if (userResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.',
            });
        }

        if (logradouro?.trim()) {
            await client.query(
                'UPDATE endereco SET logradouro = $1 WHERE usuario_id = $2',
                [logradouro.trim(), usuarioId]
            );
        }

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Perfil atualizado com sucesso.',
            user: userResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar perfil:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Este e-mail já está cadastrado.',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao atualizar o perfil.',
        });
    } finally {
        client.release();
    }
};

const getContacts = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, nome, relacao, telefone
             FROM contatos_confianca
             WHERE usuario_id = $1
             ORDER BY nome`,
            [req.params.usuarioId]
        );
        return res.json({ success: true, contacts: result.rows });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar contatos.' });
    } finally {
        client.release();
    }
};

const createContact = async (req, res) => {
    const client = await pool.connect();
    try {
        const { nome, relacao, telefone } = req.body;
        if (!nome?.trim() || !relacao?.trim() || !telefone?.trim()) {
            return res.status(400).json({ success: false, message: 'Preencha todos os campos do contato.' });
        }
        const result = await client.query(
            `INSERT INTO contatos_confianca (usuario_id, nome, relacao, telefone)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nome, relacao, telefone`,
            [req.params.usuarioId, nome.trim(), relacao.trim(), telefone.trim()]
        );
        return res.status(201).json({ success: true, contact: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar contato:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao criar contato.' });
    } finally {
        client.release();
    }
};

const updateContact = async (req, res) => {
    const client = await pool.connect();
    try {
        const { nome, relacao, telefone } = req.body;
        if (!nome?.trim() || !relacao?.trim() || !telefone?.trim()) {
            return res.status(400).json({ success: false, message: 'Preencha todos os campos do contato.' });
        }
        const result = await client.query(
            `UPDATE contatos_confianca
             SET nome = $1, relacao = $2, telefone = $3
             WHERE id = $4 AND usuario_id = $5
             RETURNING id, nome, relacao, telefone`,
            [nome.trim(), relacao.trim(), telefone.trim(), req.params.contactId, req.params.usuarioId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Contato não encontrado.' });
        return res.json({ success: true, contact: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar contato:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao atualizar contato.' });
    } finally {
        client.release();
    }
};

const deleteContact = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'DELETE FROM contatos_confianca WHERE id = $1 AND usuario_id = $2 RETURNING id',
            [req.params.contactId, req.params.usuarioId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Contato não encontrado.' });
        return res.json({ success: true, message: 'Contato removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover contato:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao remover contato.' });
    } finally {
        client.release();
    }
};

const mapEvidence = (row) => {
    const data = row.dados_criptografados ? decrypt(row.dados_criptografados) : {
        name: row.nome_arquivo,
        type: row.tipo_arquivo,
        size: row.tamanho_arquivo,
        duration: row.duracao,
        description: row.descricao,
        url: row.url_arquivo,
        content: row.content || '',
        createdAt: row.data_criacao,
    };

    return { id: row.id, ...data };
};

const registerEvidenceHistory = (client, evidenceId, usuarioId, action) =>
    client.query(
        `INSERT INTO historico_evidencias (evidencia_id, usuario_id, acao)
         VALUES ($1, $2, $3)`,
        [evidenceId, usuarioId, action]
    );

const getEvidences = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT id, nome_arquivo, tipo_arquivo, tamanho_arquivo, duracao,
                    url_arquivo, descricao, data_criacao, dados_criptografados
             FROM evidencias WHERE usuario_id = $1 ORDER BY data_criacao DESC`,
            [req.params.usuarioId]
        );
        return res.json({ success: true, evidences: result.rows.map(mapEvidence) });
    } catch (error) {
        console.error('Erro ao buscar evidências:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar evidências.' });
    } finally {
        client.release();
    }
};

const createEvidence = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            name,
            type,
            size = '',
            duration = '',
            description = '',
            url = '',
            content = '',
            contentBase64 = '',
            mimeType = '',
        } = req.body;
        if (!name?.trim() || !type?.trim()) {
            return res.status(400).json({ success: false, message: 'Nome e tipo da evidência são obrigatórios.' });
        }
        const rule = evidenceRules[type];
        const normalizedType = type.trim();
        const isDirectText = normalizedType === 'file' && typeof content === 'string' && content.length > 0;
        const hasBinaryContent = typeof contentBase64 === 'string' && contentBase64.length > 0;
        const normalizedName = isDirectText && !name.toLowerCase().endsWith('.txt') ? `${name}.txt` : name;
        const extension = normalizedName.split('.').pop()?.toLowerCase();
        let binarySizeBytes = 0;
        if (hasBinaryContent) {
            try {
                binarySizeBytes = Buffer.from(contentBase64, 'base64').length;
            } catch (error) {
                return res.status(400).json({ success: false, message: 'Conteúdo do arquivo inválido.' });
            }
        }
        const sizeBytes = isDirectText
            ? Buffer.byteLength(content, 'utf8')
            : hasBinaryContent
                ? binarySizeBytes
                : Number(req.body.sizeBytes || 0);
        if (!rule || !rule.extensions.includes(extension) || !sizeBytes || sizeBytes > rule.maxBytes) {
            return res.status(400).json({
                success: false,
                message: `Arquivo inválido. ${rule?.label || 'Tipo informado'}: formatos ${rule?.extensions.join(', ').toUpperCase() || 'não suportados'} e tamanho máximo de ${rule?.maxBytes ? `${rule.maxBytes / (1024 * 1024)} MB` : 'permitido'} por arquivo.`,
            });
        }
        const evidence = {
            name: normalizedName.trim(), type: normalizedType, size: size.trim(), duration: duration.trim(),
            description: description.trim(),
            url: url.trim(),
            content: isDirectText ? content : '',
            contentBase64: hasBinaryContent ? contentBase64 : '',
            mimeType: mimeType.trim(),
        };
        const result = await client.query(
            `INSERT INTO evidencias
                (usuario_id, nome_arquivo, tipo_arquivo, tamanho_arquivo, duracao, url_arquivo, descricao, dados_criptografados)
             VALUES ($1, '[criptografado]', '[criptografado]', NULL, NULL, '[criptografado]', NULL, $2)
             RETURNING id, dados_criptografados`,
            [req.params.usuarioId, encrypt(evidence)]
        );
        await registerEvidenceHistory(client, result.rows[0].id, req.params.usuarioId, 'criacao');
        return res.status(201).json({ success: true, evidence: mapEvidence(result.rows[0]) });
    } catch (error) {
        console.error('Erro ao criar evidência:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao criar evidência.' });
    } finally {
        client.release();
    }
};

const updateEvidence = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, description = '' } = req.body;
        if (!name?.trim()) return res.status(400).json({ success: false, message: 'O nome da evidência é obrigatório.' });
        const existing = await client.query(
            'SELECT * FROM evidencias WHERE id = $1 AND usuario_id = $2',
            [req.params.evidenceId, req.params.usuarioId]
        );
        if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Evidência não encontrada.' });
        const evidence = mapEvidence(existing.rows[0]);
        evidence.name = name.trim();
        evidence.description = description.trim();
        const result = await client.query(
            `UPDATE evidencias SET nome_arquivo = '[criptografado]', descricao = NULL, dados_criptografados = $1
             WHERE id = $2 AND usuario_id = $3 RETURNING id, dados_criptografados`,
            [encrypt(evidence), req.params.evidenceId, req.params.usuarioId]
        );
        await registerEvidenceHistory(client, result.rows[0].id, req.params.usuarioId, 'edicao');
        return res.json({ success: true, evidence: mapEvidence(result.rows[0]) });
    } catch (error) {
        console.error('Erro ao atualizar evidência:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao atualizar evidência.' });
    } finally {
        client.release();
    }
};

const deleteEvidence = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'DELETE FROM evidencias WHERE id = $1 AND usuario_id = $2 RETURNING id',
            [req.params.evidenceId, req.params.usuarioId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Evidência não encontrada.' });
        await registerEvidenceHistory(client, req.params.evidenceId, req.params.usuarioId, 'exclusao');
        return res.json({ success: true, message: 'Evidência excluída com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir evidência:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao excluir evidência.' });
    } finally {
        client.release();
    }
};

const getEvidenceHistory = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT h.id, h.evidencia_id, h.acao, h.data_hora,
                    COALESCE(e.nome_arquivo, '[evidência excluída]') AS nome_arquivo
             FROM historico_evidencias h
             LEFT JOIN evidencias e ON e.id = h.evidencia_id
             WHERE h.usuario_id = $1
             ORDER BY h.data_hora DESC`,
            [req.params.usuarioId]
        );
        return res.json({ success: true, history: result.rows });
    } catch (error) {
        console.error('Erro ao buscar histórico de evidências:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar histórico.' });
    } finally {
        client.release();
    }
};

module.exports = {
    register,
    login,
    verifyProofPin,
    getProfile,
    updateProfile,
    getContacts,
    createContact,
    updateContact,
    deleteContact,
    getEvidences,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    getEvidenceHistory,
};