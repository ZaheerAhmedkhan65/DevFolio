const ProfileSkill = require('../models/ProfileSkill');
const Profile = require('../models/Profile');
class ProfileSkillsController {

    static async getSkills(req, res) {
        try {
            const rows = await ProfileSkill.getSkillsByProfile(req.params.profileId);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addSkill(req, res) {
        try {
            const { skill_id, proficiency, display_order } = req.body;
            const profile = await Profile.findByUserId(req.user.userId);

            await ProfileSkill.addSkill({
                profile_id: profile.id,
                skill_id,
                proficiency: proficiency || 'Intermediate',
                display_order: display_order || 0
            });

            res.status(201).redirect('/settings');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateSkill(req, res) {
        try {
            const { profile_id, skill_id } = req.params;
            const updated = await ProfileSkill.updateSkill(profile_id, skill_id, req.body);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async removeSkill(req, res) {
        try {
            const { profile_id, skill_id } = req.params;
            await ProfileSkill.removeSkill(profile_id, skill_id);
            res.json({ message: "Skill removed from profile" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = ProfileSkillsController;
