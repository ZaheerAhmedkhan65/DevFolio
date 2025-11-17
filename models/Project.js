const db = require('../config/db');

class Project {

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM projects WHERE user_id = ? ORDER BY display_order ASC, created_at DESC',
            [userId]
        );
        return rows;
    }

    static async create({
        user_id,
        title,
        description,
        image_url,
        project_url,
        source_code_url,
        featured = false,
        display_order = 0
    }) {
        const [result] = await db.query(
            `INSERT INTO projects 
            (user_id, title, description, image_url, project_url, source_code_url, featured, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, title, description, image_url,
                project_url, source_code_url, featured, display_order
            ]
        );
        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowedFields = [
            'title', 'description', 'image_url', 'project_url', 'source_code_url',
            'featured', 'display_order'
        ];

        const filteredUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) filteredUpdates[key] = value;
        }

        const fields = Object.keys(filteredUpdates).map(key => `${key} = ?`);
        const values = Object.values(filteredUpdates);
        values.push(id);

        await db.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM projects WHERE id = ?', [id]);
    }
}

module.exports = Project;
