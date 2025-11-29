const db = require('../config/db');

class PostView {

    static async addView(post_id, viewer_id = null, viewer_ip = null) {
        await db.query(
            `INSERT INTO post_views (post_id, viewer_id, viewer_ip, view_date)
             VALUES (?, ?, ?, CURDATE())`,
            [post_id, viewer_id, viewer_ip]
        );
    }

    static async countViews(post_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM post_views WHERE post_id = ?',
            [post_id]
        );
        return rows[0].count;
    }

    static async countViewsByDate(post_id, date) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM post_views WHERE post_id = ? AND view_date = ?',
            [post_id, date]
        );
        return rows[0].count;
    }

    static async getRecentViews(post_id, limit = 10) {
        const [rows] = await db.query(
            `SELECT * FROM post_views WHERE post_id = ? ORDER BY view_time DESC LIMIT ?`,
            [post_id, limit]
        );
        return rows;
    }
}

module.exports = PostView;
