const db = require('../config/db');

class Profile {

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM profiles WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({
        user_id,
        display_name,
        title,
        bio,
        location,
        company,
        website_url,
        profile_picture_url,
        theme = 'default',
        is_public = true
    }) {
        const [result] = await db.query(
            `INSERT INTO profiles 
            (user_id, display_name, title, bio, location, company, website_url, profile_picture_url, theme, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, display_name, title, bio, location, company,
                website_url, profile_picture_url, theme, is_public
            ]
        );

        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowedFields = [
            'display_name', 'title', 'bio', 'location', 'company', 'website_url',
            'profile_picture_url', 'theme', 'is_public'
        ];

        const filteredUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) filteredUpdates[key] = value;
        }

        const fields = Object.keys(filteredUpdates).map(key => `${key} = ?`);
        const values = Object.values(filteredUpdates);
        values.push(id);

        await db.query(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM profiles WHERE id = ?', [id]);
    }
}

module.exports = Profile;
