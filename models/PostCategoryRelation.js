// models/PostCategoryRelation.js
const db = require('../config/db');

class PostCategoryRelation {
    static async add(post_id, category_id) {
        await db.query('INSERT INTO post_category_relations (post_id, category_id) VALUES (?, ?)', [post_id, category_id]);
    }

    static async remove(post_id, category_id) {
        await db.query('DELETE FROM post_category_relations WHERE post_id = ? AND category_id = ?', [post_id, category_id]);
    }

    static async findCategoriesForPost(post_id) {
        const [rows] = await db.query(
            `SELECT c.* FROM post_categories c
             JOIN post_category_relations pc ON pc.category_id = c.id
             WHERE pc.post_id = ?`, [post_id]
        );
        return rows;
    }
}

module.exports = PostCategoryRelation;
