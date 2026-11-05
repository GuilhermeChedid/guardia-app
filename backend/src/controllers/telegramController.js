const crypto = require('crypto');
const https = require('https');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = require('../../db');

const getBotConfig = () => ({
    token: process.env.TELEGRAM_BOT_TOKEN,
    username: process.env.TELEGRAM_BOT_USERNAME,
});

const telegramRequest = (token, method, payload) => new Promise((resolve, reject) => {
    const request = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${token}/${method}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    }, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (!response.statusCode || response.statusCode >= 400 || !data.ok) {
                    reject(new Error(data.description || `Telegram retornou HTTP ${response.statusCode}`));
                    return;
                }
                resolve(data.result);
            } catch (error) {
                reject(new Error('Resposta inválida da API do Telegram.'));
            }
        });
    });

    request.on('error', reject);
    request.write(JSON.stringify(payload));
    request.end();
});

const requireBotConfig = () => {
    const config = getBotConfig();
    if (!config.token || !config.username) {
        throw new Error('TELEGRAM_BOT_TOKEN e TELEGRAM_BOT_USERNAME não configurados.');
    }
    return config;
};

const createTelegramLink = async (req, res) => {
    const client = await pool.connect();
    try {
        const { token, username } = requireBotConfig();
        const linkToken = crypto.randomBytes(24).toString('hex');
        const result = await client.query(
            `UPDATE contatos_confianca
             SET telegram_link_token = $1
             WHERE id = $2 AND usuario_id = $3
             RETURNING id`,
            [linkToken, req.params.contactId, req.params.usuarioId],
        );
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: 'Contato não encontrado.' });
        }

        return res.json({
            success: true,
            url: `https://t.me/${username}?start=${linkToken}`,
            botUsername: username,
        });
    } catch (error) {
        console.error('Erro ao criar vínculo com Telegram:', error);
        return res.status(503).json({
            success: false,
            message: 'Telegram ainda não está configurado no servidor.',
        });
    } finally {
        client.release();
    }
};

const telegramWebhook = async (req, res) => {
    const message = req.body?.message;
    const text = message?.text || '';
    const match = text.match(/^\/start(?:\s+([A-Za-z0-9_-]+))?$/);
    if (!message?.chat?.id || !match?.[1]) {
        return res.sendStatus(200);
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            `UPDATE contatos_confianca
             SET telegram_chat_id = $1, telegram_link_token = NULL
             WHERE telegram_link_token = $2
             RETURNING nome`,
            [String(message.chat.id), match[1]],
        );
        if (result.rows.length) {
            const { token } = requireBotConfig();
            await telegramRequest(token, 'sendMessage', {
                chat_id: message.chat.id,
                text: `Vínculo concluído. Você receberá os alertas SOS de ${result.rows[0].nome}.`,
            });
        }
        return res.sendStatus(200);
    } catch (error) {
        console.error('Erro ao processar webhook do Telegram:', error);
        return res.sendStatus(200);
    } finally {
        client.release();
    }
};

const dispatchTelegramSos = async (req, res) => {
    const client = await pool.connect();
    try {
        const { usuario_id, nome, latitude, longitude, accuracy } = req.body;
        if (!usuario_id || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
            return res.status(400).json({ success: false, message: 'Usuário e localização são obrigatórios.' });
        }

        const { token } = requireBotConfig();
        const contacts = await client.query(
            `SELECT nome, telegram_chat_id
             FROM contatos_confianca
             WHERE usuario_id = $1 AND telegram_chat_id IS NOT NULL`,
            [usuario_id],
        );
        if (!contacts.rows.length) {
            return res.status(409).json({
                success: false,
                message: 'Nenhum contato está vinculado ao Telegram. Gere o link de vínculo na tela de contatos.',
            });
        }

        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        const message = [
            '🚨 SOCORRO! Alerta de emergência do Guardiã.',
            `Nome: ${nome || 'Usuária'}`,
            `Localização: ${mapsLink}`,
            `Precisão aproximada: ${accuracy ? `${Math.round(accuracy)} m` : 'não informada'}.`,
        ].join('\n');

        const results = await Promise.allSettled(contacts.rows.map((contact) =>
            telegramRequest(token, 'sendMessage', { chat_id: contact.telegram_chat_id, text: message })
        ));
        const sent = results.filter((result) => result.status === 'fulfilled').length;
        if (!sent) {
            throw new Error('Nenhum alerta foi aceito pelo Telegram.');
        }
        return res.json({ success: true, sent });
    } catch (error) {
        console.error('Erro ao enviar SOS pelo Telegram:', error);
        return res.status(502).json({
            success: false,
            message: 'Não foi possível enviar o alerta pelo Telegram.',
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createTelegramLink,
    telegramWebhook,
    dispatchTelegramSos,
};
