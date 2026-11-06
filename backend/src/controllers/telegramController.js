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

        const results = await Promise.allSettled(contacts.rows.map(async (contact) => {
            await telegramRequest(token, 'sendMessage', { chat_id: contact.telegram_chat_id, text: message });
            const locationMessage = await telegramRequest(token, 'sendLocation', {
                chat_id: contact.telegram_chat_id,
                latitude: Number(latitude),
                longitude: Number(longitude),
                live_period: 86400,
            });
            return { chat_id: contact.telegram_chat_id, message_id: locationMessage.message_id };
        }));
        const sentLocations = results
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value);
        const sent = sentLocations.length;
        if (!sent) {
            const failureReasons = results
                .filter((result) => result.status === 'rejected')
                .map((result) => result.reason?.message || String(result.reason));
            console.error('Falhas retornadas pelo Telegram:', failureReasons);
            throw new Error('Nenhum alerta foi aceito pelo Telegram.');
        }
        const session = await client.query(
            `INSERT INTO sessoes_sos (usuario_id, nome, mensagens_localizacao)
             VALUES ($1, $2, $3::jsonb)
             RETURNING id`,
            [usuario_id, nome || 'Usuária', JSON.stringify(sentLocations)],
        );
        return res.json({ success: true, sent, session_id: session.rows[0].id });
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

const updateTelegramSosLocation = async (req, res) => {
    const client = await pool.connect();
    try {
        const { latitude, longitude } = req.body;
        if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
            return res.status(400).json({ success: false, message: 'Localização inválida.' });
        }
        const { token } = requireBotConfig();
        const sessionResult = await client.query(
            `SELECT mensagens_localizacao FROM sessoes_sos
             WHERE id = $1 AND ativa = TRUE`,
            [req.params.sessionId],
        );
        if (!sessionResult.rows.length) {
            return res.status(404).json({ success: false, message: 'Sessão SOS não encontrada ou encerrada.' });
        }
        const messages = sessionResult.rows[0].mensagens_localizacao || [];
        const results = await Promise.allSettled(messages.map((message) =>
            telegramRequest(token, 'editMessageLiveLocation', {
                chat_id: message.chat_id,
                message_id: message.message_id,
                latitude: Number(latitude),
                longitude: Number(longitude),
            })
        ));
        if (!results.some((result) => result.status === 'fulfilled')) {
            throw new Error('Nenhuma localização SOS foi atualizada no Telegram.');
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Erro ao atualizar localização SOS:', error);
        return res.status(502).json({ success: false, message: 'Não foi possível atualizar a localização do SOS.' });
    } finally {
        client.release();
    }
};

const stopTelegramSos = async (req, res) => {
    const client = await pool.connect();
    try {
        const { token } = requireBotConfig();
        const sessionResult = await client.query(
            `SELECT mensagens_localizacao FROM sessoes_sos
             WHERE id = $1 AND ativa = TRUE`,
            [req.params.sessionId],
        );
        if (!sessionResult.rows.length) return res.json({ success: true });
        const messages = sessionResult.rows[0].mensagens_localizacao || [];
        await Promise.allSettled(messages.map((message) =>
            telegramRequest(token, 'stopMessageLiveLocation', {
                chat_id: message.chat_id,
                message_id: message.message_id,
            })
        ));
        await client.query(
            `UPDATE sessoes_sos SET ativa = FALSE, encerrada_em = CURRENT_TIMESTAMP WHERE id = $1`,
            [req.params.sessionId],
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('Erro ao encerrar localização SOS:', error);
        return res.status(502).json({ success: false, message: 'Não foi possível encerrar a localização do SOS.' });
    } finally {
        client.release();
    }
};

module.exports = {
    createTelegramLink,
    telegramWebhook,
    dispatchTelegramSos,
    updateTelegramSosLocation,
    stopTelegramSos,
};
