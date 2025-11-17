const db = require('../config/db');

class User {

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM users');
        return rows[0].count;
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Instead of deleting, deactivate user
    static async deleteUser(id) {
        await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
    }

    // CREATE USER according to table schema
    static async create({
        username,
        email,
        password_hash,
        role = 'user'
    }) {
        const [result] = await db.query(
            `INSERT INTO users 
            (username, email, password_hash, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [username, email, password_hash, role]
        );

        return this.findById(result.insertId);
    }

    // Update password + clear reset token
    static async updatePassword(userId, newPasswordHash) {
        await db.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [newPasswordHash, userId]
        );
        return this.findById(userId);
    }

    // Save reset token
    static async setResetToken(email, resetToken, resetTokenExpires) {
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE email = ?',
            [resetToken, resetTokenExpires, email]
        );
        return this.findByEmail(email);
    }

    // Find user by token
    static async findByResetToken(token) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
            [token]
        );
        return rows[0];
    }

    // Update user fields (only allow username)
    static async updateUser(id, updates) {
        const allowedFields = ['username'];
        const filteredUpdates = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = value;
            }
        }

        filteredUpdates.updated_at = new Date();

        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(filteredUpdates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);

        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return this.findById(id);
    }

    // Update active status
    static async updateStatus(id, isActive) {
        const [result] = await db.query(
            'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
            [isActive, id]
        );
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT id, username, email, role, is_active FROM users');
        return rows;
    }
}

module.exports = User;
