// models/PostTagRelation.js
const db = require('../config/db');

class PostTagRelation {
    static async add(post_id, tag_id) {
        await db.query('INSERT INTO post_tag_relations (post_id, tag_id) VALUES (?, ?)', [post_id, tag_id]);
    }

    static async remove(post_id, tag_id) {
        await db.query('DELETE FROM post_tag_relations WHERE post_id = ? AND tag_id = ?', [post_id, tag_id]);
    }

    static async findTagsForPost(post_id) {
        const [rows] = await db.query(
            `SELECT t.* FROM post_tags t
             JOIN post_tag_relations pt ON pt.tag_id = t.id
             WHERE pt.post_id = ?`, [post_id]
        );
        return rows;
    }
}

module.exports = PostTagRelation;
