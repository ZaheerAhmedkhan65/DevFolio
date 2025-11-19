const db = require('../config/db');

class ProfileSkill {

    static async findByProfileId(profileId) {
        const [rows] = await db.query(
            `SELECT ps.*, s.name 
             FROM profile_skills ps 
             JOIN skills s ON ps.skill_id = s.id
             WHERE ps.profile_id = ?
             ORDER BY ps.display_order ASC`,
            [profileId]
        );
        return rows;
    }

    static async addSkill({profile_id, skill_id, proficiency = 'Intermediate', display_order = 0}) {
        await db.query(
            `INSERT INTO profile_skills (profile_id, skill_id, proficiency, display_order)
             VALUES (?, ?, ?, ?)`,
            [profile_id, skill_id, proficiency, display_order]
        );
    }

    static async update(profile_id, skill_id, updates) {
        const allowedFields = ['proficiency', 'display_order'];
        
        const filteredUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) filteredUpdates[key] = value;
        }

        const fields = Object.keys(filteredUpdates).map(key => `${key} = ?`);
        const values = Object.values(filteredUpdates);
        values.push(profile_id, skill_id);

        await db.query(
            `UPDATE profile_skills SET ${fields.join(', ')} 
             WHERE profile_id = ? AND skill_id = ?`,
            values
        );
    }

    static async removeSkill(profile_id, skill_id) {
        await db.query(
            'DELETE FROM profile_skills WHERE profile_id = ? AND skill_id = ?',
            [profile_id, skill_id]
        );
    }
}

module.exports = ProfileSkill;
