const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const shortcutRoutes = require('./routes/shortcutRoutes');

const app = express();

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Sessão
app.use(session({
    secret: 'xp_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 dia
}));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/shortcuts', shortcutRoutes);

// Frontend
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login.html', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});