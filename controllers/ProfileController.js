const Profile = require('../models/Profile');

class ProfileController {

    static async getProfile(req, res) {
        try {
            const profile = await Profile.findByUserId(req.params.userId);
            if (!profile) return res.status(404).json({ message: "Profile not found" });
            res.json(profile);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createProfile(req, res) {
        try {
            const profile = await Profile.create(req.body);
            res.status(201).json(profile);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            const updated = await Profile.update(req.params.id, req.body);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteProfile(req, res) {
        try {
            await Profile.delete(req.params.id);
            res.json({ message: "Profile deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProfileController;
