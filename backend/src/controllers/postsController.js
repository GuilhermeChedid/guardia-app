const pool = require('../../../db');

const isAdmin = async (client, usuarioId) => {
    const result = await client.query('SELECT is_admin FROM usuarios WHERE id = $1', [usuarioId]);
    return result.rows[0]?.is_admin === true;
};

const listPosts = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.query.usuario_id;
        const result = await client.query(
            `SELECT p.id, p.titulo, p.categoria, p.conteudo, p.imagem_url, p.data_publicacao,
                    COUNT(DISTINCT c.id)::int AS comentarios_count,
                    COUNT(DISTINCT l.usuario_id)::int AS curtidas_count,
                    EXISTS(SELECT 1 FROM curtidas my_l WHERE my_l.post_id = p.id AND my_l.usuario_id = $1) AS is_liked,
                    COALESCE(json_agg(DISTINCT jsonb_build_object(
                        'id', c.id, 'author', u.nome, 'avatarImage', u.url_foto_perfil, 'text', c.texto, 'time', c.data_comentario
                    )) FILTER (WHERE c.id IS NOT NULL), '[]') AS comentarios
             FROM posts p
             LEFT JOIN curtidas l ON l.post_id = p.id
             LEFT JOIN comentarios c ON c.post_id = p.id
             LEFT JOIN usuarios u ON u.id = c.usuario_id
             GROUP BY p.id
             ORDER BY p.data_publicacao DESC`,
            [userId || null]
        );
        return res.json({ success: true, posts: result.rows });
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar informações.' });
    } finally { client.release(); }
};

const createPost = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await isAdmin(client, req.body.usuario_id))) return res.status(403).json({ success: false, message: 'Apenas administradores podem criar posts.' });
        const { titulo, categoria, conteudo, imagem_url = null } = req.body;
        if (!titulo?.trim() || !categoria?.trim() || !conteudo?.trim()) return res.status(400).json({ success: false, message: 'Preencha título, categoria e conteúdo.' });
        const result = await client.query(
            `INSERT INTO posts (autor_id, titulo, categoria, conteudo, imagem_url)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.body.usuario_id, titulo.trim(), categoria.trim(), conteudo.trim(), imagem_url]
        );
        return res.status(201).json({ success: true, post: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao criar post.' });
    } finally { client.release(); }
};

const updatePost = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await isAdmin(client, req.body.usuario_id))) return res.status(403).json({ success: false, message: 'Apenas administradores podem editar posts.' });
        const { titulo, categoria, conteudo, imagem_url = null } = req.body;
        const result = await client.query(
            `UPDATE posts SET titulo = $1, categoria = $2, conteudo = $3, imagem_url = $4
             WHERE id = $5 RETURNING *`,
            [titulo?.trim(), categoria?.trim(), conteudo?.trim(), imagem_url, req.params.postId]
        );
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Post não encontrado.' });
        return res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        console.error('Erro ao editar post:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao editar post.' });
    } finally { client.release(); }
};

const deletePost = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!(await isAdmin(client, req.body.usuario_id))) return res.status(403).json({ success: false, message: 'Apenas administradores podem excluir posts.' });
        const result = await client.query('DELETE FROM posts WHERE id = $1 RETURNING id', [req.params.postId]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Post não encontrado.' });
        return res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao excluir post.' });
    } finally { client.release(); }
};

const toggleLike = async (req, res) => {
    const client = await pool.connect();
    try {
        const { usuario_id } = req.body;
        const existing = await client.query('SELECT 1 FROM curtidas WHERE post_id = $1 AND usuario_id = $2', [req.params.postId, usuario_id]);
        if (existing.rows.length) await client.query('DELETE FROM curtidas WHERE post_id = $1 AND usuario_id = $2', [req.params.postId, usuario_id]);
        else await client.query('INSERT INTO curtidas (post_id, usuario_id) VALUES ($1, $2)', [req.params.postId, usuario_id]);
        return res.json({ success: true, liked: !existing.rows.length });
    } catch (error) {
        console.error('Erro ao atualizar curtida:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao atualizar curtida.' });
    } finally { client.release(); }
};

const addComment = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.body.usuario_id || !req.body.texto?.trim()) return res.status(400).json({ success: false, message: 'Comentário inválido.' });
        const result = await client.query(
            `INSERT INTO comentarios (post_id, usuario_id, texto) VALUES ($1, $2, $3)
             RETURNING id, texto, data_comentario`,
            [req.params.postId, req.body.usuario_id, req.body.texto.trim()]
        );
        return res.status(201).json({ success: true, comment: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao criar comentário.' });
    } finally { client.release(); }
};

module.exports = { listPosts, createPost, updatePost, deletePost, toggleLike, addComment };
