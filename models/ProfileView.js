const db = require('../config/db');

class ProfileView {

    static async addView(profile_id, viewer_id = null, viewer_ip = null, user_agent = null, referrer = null) {
        await db.query(
            `INSERT INTO profile_views (profile_id, viewer_id, viewer_ip, user_agent, referrer, view_date)
             VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [profile_id, viewer_id, viewer_ip, user_agent, referrer]
        );
    }

    static async countViews(profile_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM profile_views WHERE profile_id = ?',
            [profile_id]
        );
        return rows[0].count;
    }

    static async countViewsByDate(profile_id, date) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM profile_views WHERE profile_id = ? AND view_date = ?',
            [profile_id, date]
        );
        return rows[0].count;
    }

    static async getRecentViews(profile_id, limit = 10) {
        const [rows] = await db.query(
            `SELECT * FROM profile_views WHERE profile_id = ? ORDER BY view_time DESC LIMIT ?`,
            [profile_id, limit]
        );
        return rows;
    }
}

module.exports = ProfileView;
