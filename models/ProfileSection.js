const db = require('../config/db');

class ProfileSection {
    
    static async findByProfileId(profileId) {
        const [rows] = await db.query(
            'SELECT * FROM profile_sections WHERE profile_id = ? ORDER BY display_order, created_at DESC', 
            [profileId]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM profile_sections WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByProfileIdAndType(profileId, sectionType) {
        const [rows] = await db.query(
            'SELECT * FROM profile_sections WHERE profile_id = ? AND section_type = ? ORDER BY display_order, created_at DESC', 
            [profileId, sectionType]
        );
        return rows;
    }

    static async create({
        profile_id,
        section_type,
        title,
        subtitle = null,
        description = null,
        content = null,
        start_date = null,
        end_date = null,
        is_current = false,
        display_order = 0,
        is_public = true
    }) {
        const [result] = await db.query(
            `INSERT INTO profile_sections 
            (profile_id, section_type, title, subtitle, description, content, start_date, end_date, is_current, display_order, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                profile_id, section_type, title, subtitle, description, 
                content ? JSON.stringify(content) : null,
                start_date, end_date, is_current ? 1 : 0, display_order, is_public ? 1 : 0
            ]
        );

        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowedFields = [
            'section_type', 'title', 'subtitle', 'description', 'content',
            'start_date', 'end_date', 'is_current', 'display_order', 'is_public'
        ];

        const filteredUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                // Handle JSON content serialization
                if (key === 'content' && value !== null) {
                    filteredUpdates[key] = JSON.stringify(value);
                } else {
                    filteredUpdates[key] = value;
                }
            }
        }

        const fields = Object.keys(filteredUpdates).map(key => `${key} = ?`);
        const values = Object.values(filteredUpdates);
        values.push(id);

        if (fields.length > 0) {
            await db.query(`UPDATE profile_sections SET ${fields.join(', ')} WHERE id = ?`, values);
        }

        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM profile_sections WHERE id = ?', [id]);
    }

    static async updateDisplayOrder(profileId, sectionOrders) {
        // sectionOrders should be an array of {id: sectionId, display_order: order}
        const promises = sectionOrders.map(({ id, display_order }) => 
            db.query('UPDATE profile_sections SET display_order = ? WHERE id = ? AND profile_id = ?', 
                    [display_order, id, profileId])
        );
        
        await Promise.all(promises);
    }

    static async getNextDisplayOrder(profileId) {
        const [rows] = await db.query(
            'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM profile_sections WHERE profile_id = ?',
            [profileId]
        );
        return rows[0].next_order;
    }

    static async findByProfileIdPublic(profileId) {
        const [rows] = await db.query(
            `SELECT * FROM profile_sections 
             WHERE profile_id = ? AND is_public = true 
             ORDER BY display_order, created_at DESC`,
            [profileId]
        );
        return rows;
    }

    static async countByProfileId(profileId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM profile_sections WHERE profile_id = ?',
            [profileId]
        );
        return rows[0].count;
    }
}

module.exports = ProfileSection;