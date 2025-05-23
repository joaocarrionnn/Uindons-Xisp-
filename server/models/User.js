const pool = require('../config/database');

class User {
    static async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async create(username, password) {
        const [result] = await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );
        return result.insertId;
    }
}

module.exports = User;