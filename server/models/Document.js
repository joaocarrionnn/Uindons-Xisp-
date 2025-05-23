const pool = require('../config/database');

class Document {
    static async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY filename',
            [userId]
        );
        return rows;
    }

    static async create(userId, filename, content) {
        const [result] = await pool.query(
            'INSERT INTO documents (user_id, filename, content) VALUES (?, ?, ?)',
            [userId, filename, content]
        );
        return result.insertId;
    }

    static async update(id, filename, content) {
        await pool.query(
            'UPDATE documents SET filename = ?, content = ? WHERE id = ?',
            [filename, content, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM documents WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async checkDuplicate(userId, filename) {
        const [rows] = await pool.query(
            'SELECT id FROM documents WHERE user_id = ? AND filename = ?',
            [userId, filename]
        );
        return rows.length > 0;
    }
}

module.exports = Document;