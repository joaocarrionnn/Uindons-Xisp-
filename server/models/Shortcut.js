const pool = require('../config/database');

class Shortcut {
    static async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM shortcuts WHERE user_id = ? ORDER BY position',
            [userId]
        );
        return rows;
    }

    static async create(userId, title, icon, position) {
        const [result] = await pool.query(
            'INSERT INTO shortcuts (user_id, title, icon, position) VALUES (?, ?, ?, ?)',
            [userId, title, icon, position]
        );
        return result.insertId;
    }

    static async update(id, title, icon, position) {
        await pool.query(
            'UPDATE shortcuts SET title = ?, icon = ?, position = ? WHERE id = ?',
            [title, icon, position, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM shortcuts WHERE id = ?', [id]);
    }

    static async updatePositions(shortcuts) {
        const promises = shortcuts.map(shortcut => {
            return pool.query(
                'UPDATE shortcuts SET position = ? WHERE id = ?',
                [shortcut.position, shortcut.id]
            );
        });
        await Promise.all(promises);
    }
}

module.exports = Shortcut;