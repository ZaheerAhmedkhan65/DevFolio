const db = require('../config/db');

class Skill {

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM skills WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByName(name) {
        const [rows] = await db.query('SELECT * FROM skills WHERE name = ?', [name]);
        return rows[0];
    }

    static async create(name) {
        const [result] = await db.query('INSERT INTO skills (name) VALUES (?)', [name]);
        return this.findById(result.insertId);
    }

    static async delete(id) {
        await db.query('DELETE FROM skills WHERE id = ?', [id]);
    }
}

module.exports = Skill;
