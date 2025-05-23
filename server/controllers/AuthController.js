const bcrypt = require('bcrypt');
const User = require('../models/User');

class AuthController {
    static async login(req, res) {
        const { username, password } = req.body;
        
        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }

            req.session.user = { id: user.id, username: user.username };
            res.json({ success: true, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    }

    

    static async register(req, res) {
        const { username, password } = req.body;
        
        try {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'Usuário já existe' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create(username, hashedPassword);
            
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    }

    static logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao fazer logout' });
            }
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    }

    static checkAuth(req, res) {
        if (req.session.user) {
            res.json({ authenticated: true, user: req.session.user });
        } else {
            res.json({ authenticated: false });
        }
    }

    static logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Erro ao fazer logout' });
            }
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    }
}

module.exports = AuthController;