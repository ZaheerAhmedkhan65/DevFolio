const db = require('../config/db');

class SocialLink {

    static async findByProfileId(profileId) {
        const [rows] = await db.query(
            'SELECT * FROM social_links WHERE profile_id = ? ORDER BY display_order ASC',
            [profileId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM social_links WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({
        profile_id,
        platform_name,
        platform_icon,
        url,
        display_order = 0
    }) {
        const [result] = await db.query(
            `INSERT INTO social_links 
            (profile_id, platform_name, platform_icon, url, display_order)
            VALUES (?, ?, ?, ?, ?)`,
            [profile_id, platform_name, platform_icon, url, display_order]
        );

        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowedFields = ['platform_name', 'platform_icon', 'url', 'display_order'];

        const filteredUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) filteredUpdates[key] = value;
        }

        const fields = Object.keys(filteredUpdates).map(key => `${key} = ?`);
        const values = Object.values(filteredUpdates);
        values.push(id);

        await db.query(
            `UPDATE social_links SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM social_links WHERE id = ?', [id]);
    }
}

module.exports = SocialLink;
