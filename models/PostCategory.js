// models/PostCategory.js
const db = require('../config/db');

class PostCategory {
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM post_categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM post_categories');
        return rows[0].count;
    }

    static async findBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM post_categories WHERE slug = ?', [slug]);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM post_categories ORDER BY name ASC');
        return rows;
    }

    static async create({ name, slug, description = null }) {
        const [result] = await db.query(
            'INSERT INTO post_categories (name, slug, description, created_at) VALUES (?, ?, ?, NOW())',
            [name, slug, description]
        );
        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowed = ['name','slug','description'];
        const fields = [];
        const values = [];
        for (const [k,v] of Object.entries(updates)) {
            if (allowed.includes(k)) {
                fields.push(`${k} = ?`);
                values.push(v);
            }
        }
        values.push(id);
        await db.query(`UPDATE post_categories SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM post_categories WHERE id = ?', [id]);
    }
}

module.exports = PostCategory;
