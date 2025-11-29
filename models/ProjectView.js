const db = require('../config/db');

class ProjectView {

    static async addView(project_id, viewer_id = null, viewer_ip = null, user_agent = null) {
        await db.query(
            `INSERT INTO project_views (project_id, viewer_id, viewer_ip, user_agent, view_date)
             VALUES (?, ?, ?, ?, CURDATE())`,
            [project_id, viewer_id, viewer_ip, user_agent]
        );
    }

    static async countViews(project_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM project_views WHERE project_id = ?',
            [project_id]
        );
        return rows[0].count;
    }

    static async countViewsByDate(project_id, date) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM project_views WHERE project_id = ? AND view_date = ?',
            [project_id, date]
        );
        return rows[0].count;
    }

    static async getRecentViews(project_id, limit = 10) {
        const [rows] = await db.query(
            `SELECT * FROM project_views WHERE project_id = ? ORDER BY view_time DESC LIMIT ?`,
            [project_id, limit]
        );
        return rows;
    }
}

module.exports = ProjectView;
