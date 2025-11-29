const ProfileSection = require('../models/ProfileSection');

class ProfileSectionController {

    // GET all sections of a profile
    static async getSections(req, res) {
        try {
            const sections = await ProfileSection.findByProfileId(req.params.profileId);
            res.json(sections);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET public sections only
    static async getPublicSections(req, res) {
        try {
            const sections = await ProfileSection.findByProfileIdPublic(req.params.profileId);
            res.json(sections);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET a single section by id
    static async getSection(req, res) {
        try {
            const section = await ProfileSection.findById(req.params.id);
            res.json(section);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // CREATE a new section
    static async createSection(req, res) {
        try {
            const section = await ProfileSection.create(req.body);
            res.status(201).json(section);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // UPDATE a section
    static async updateSection(req, res) {
        try {
            const section = await ProfileSection.update(req.params.id, req.body);
            res.json(section);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // DELETE a section
    static async deleteSection(req, res) {
        try {
            await ProfileSection.delete(req.params.id);
            res.json({ message: "Profile section removed" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // UPDATE display order for multiple sections
    static async updateDisplayOrder(req, res) {
        try {
            // req.body = [ { id, display_order }, ... ]
            await ProfileSection.updateDisplayOrder(req.params.profileId, req.body);
            res.json({ message: "Display order updated" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Count sections
    static async countSections(req, res) {
        try {
            const count = await ProfileSection.countByProfileId(req.params.profileId);
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProfileSectionController;
