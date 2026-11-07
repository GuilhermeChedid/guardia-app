const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postsRoutes = require('./routes/postsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(
    '/uploads',
    express.static(
        process.env.VERCEL
            ? path.join('/tmp', 'guardia-uploads')
            : path.resolve(__dirname, '../uploads')
    )
);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);
app.post('/api/telegram/webhook', (req, res, next) => {
    req.url = '/telegram/webhook';
    authRoutes.handle(req, res, next);
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Guardiã funcionando!',
    });
});

module.exports = app;