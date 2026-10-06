const pool = require('../../../db');

const requireAdmin = async (client, adminId) => {
    const result = await client.query('SELECT is_admin FROM usuarios WHERE id = $1', [adminId]);
    return result.rows[0]?.is_admin === true;
};

const listUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await requireAdmin(client, req.query.admin_id))) return res.status(403).json({ success: false, message: 'Acesso administrativo obrigatório.' });
        const result = await client.query(
            `SELECT u.id, u.nome, u.email, u.telefone, u.is_admin, u.criado_em,
                    e.cidade, COUNT(DISTINCT c.id)::int AS contatos_count
             FROM usuarios u
             LEFT JOIN endereco e ON e.usuario_id = u.id
             LEFT JOIN contatos_confianca c ON c.usuario_id = u.id
             GROUP BY u.id, e.cidade ORDER BY u.criado_em DESC`
        );
        return res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao listar usuários.' });
    } finally { client.release(); }
};

const deleteUser = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await requireAdmin(client, req.body.admin_id))) return res.status(403).json({ success: false, message: 'Acesso administrativo obrigatório.' });
        if (req.params.userId === req.body.admin_id) return res.status(400).json({ success: false, message: 'O administrador não pode excluir a própria conta.' });
        const result = await client.query('DELETE FROM usuarios WHERE id = $1 AND is_admin = FALSE RETURNING id', [req.params.userId]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Usuário não encontrado ou não pode ser excluído.' });
        return res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao excluir usuário.' });
    } finally { client.release(); }
};

const getReports = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await requireAdmin(client, req.query.admin_id))) return res.status(403).json({ success: false, message: 'Acesso administrativo obrigatório.' });
        const days = Number(req.query.days) || 7;
        const startDate = req.query.start_date || null;
        const endDate = req.query.end_date || null;
        const result = await client.query(
            `WITH daily AS (
                SELECT DATE(data_hora AT TIME ZONE 'America/Sao_Paulo') AS day, COUNT(*)::int AS count
                FROM eventos_sos
                WHERE (($2::date IS NULL AND $3::date IS NULL AND data_hora >= NOW() - ($1::int * INTERVAL '1 day'))
                    OR ($2::date IS NOT NULL AND data_hora >= $2::date
                        AND ($3::date IS NULL OR data_hora < ($3::date + INTERVAL '1 day'))))
                GROUP BY 1
             )
             SELECT COALESCE(SUM(count), 0)::int AS total,
                    COALESCE(ROUND(SUM(count)::numeric / NULLIF($1, 0), 1), 0) AS average,
                    COALESCE(MAX(count), 0)::int AS peak,
                    COALESCE(json_agg(json_build_object('day', day, 'count', count) ORDER BY day), '[]') AS daily
             FROM daily`,
            [days, startDate, endDate]
        );
        const report = result.rows[0];
        if (typeof report.daily === 'string') report.daily = JSON.parse(report.daily);
        return res.json({ success: true, report });
    } catch (error) {
        console.error('Erro ao buscar relatório:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar relatório.' });
    } finally { client.release(); }
};

const registerSos = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.body.usuario_id) return res.status(400).json({ success: false, message: 'Usuário obrigatório.' });
        await client.query('INSERT INTO eventos_sos (usuario_id) VALUES ($1)', [req.body.usuario_id]);
        return res.status(201).json({ success: true });
    } catch (error) {
        console.error('Erro ao registrar SOS:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao registrar SOS.' });
    } finally { client.release(); }
};

module.exports = { listUsers, deleteUser, getReports, registerSos };
