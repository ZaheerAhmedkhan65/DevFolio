// models/PostTag.js
const db = require('../config/db');

class PostTag {
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM post_tags WHERE id = ?', [id]);
        return rows[0];
    }

    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM post_tags');
        return rows[0].count;
    }

    static async findBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM post_tags WHERE slug = ?', [slug]);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM post_tags ORDER BY name ASC');
        return rows;
    }

    static async create({ name, slug }) {
        const [result] = await db.query(
            'INSERT INTO post_tags (name, slug, created_at) VALUES (?, ?, NOW())',
            [name, slug]
        );
        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowed = ['name','slug'];
        const fields = [];
        const values = [];
        for (const [k,v] of Object.entries(updates)) {
            if (allowed.includes(k)) {
                fields.push(`${k} = ?`);
                values.push(v);
            }
        }
        values.push(id);
        await db.query(`UPDATE post_tags SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM post_tags WHERE id = ?', [id]);
    }
}

module.exports = PostTag;
