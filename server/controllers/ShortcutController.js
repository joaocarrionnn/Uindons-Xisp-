const Shortcut = require('../models/Shortcut');

class ShortcutController {
    static async getShortcuts(req, res) {
        try {
            const shortcuts = await Shortcut.findByUserId(req.session.user.id);
            res.json(shortcuts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar atalhos' });
        }
    }

    static async createShortcut(req, res) {
        const { title, icon, position } = req.body;
        
        try {
            const id = await Shortcut.create(req.session.user.id, title, icon, position);
            res.json({ id, title, icon, position });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar atalho' });
        }
    }

    static async updateShortcut(req, res) {
        const { id } = req.params;
        const { title, icon, position } = req.body;
        
        try {
            await Shortcut.update(id, title, icon, position);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar atalho' });
        }
    }

    static async deleteShortcut(req, res) {
        const { id } = req.params;
        
        try {
            await Shortcut.delete(id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao deletar atalho' });
        }
    }

    static async updateShortcutPositions(req, res) {
        const { shortcuts } = req.body;
        
        try {
            await Shortcut.updatePositions(shortcuts);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar posições' });
        }
    }
}

module.exports = ShortcutController;