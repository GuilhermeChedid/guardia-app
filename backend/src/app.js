const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postsRoutes = require('./routes/postsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Guardiã funcionando!',
    });
});

module.exports = app;