const SocialLink = require('../models/SocialLink');

class SocialLinksController {

    static async getLinks(req, res) {
        try {
            const links = await SocialLink.findByProfileId(req.params.profileId);
            res.json(links);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getLink(req, res) {
        try {
            const link = await SocialLink.findById(req.params.id);
            if (!link) return res.status(404).json({ message: "Social link not found" });
            res.json(link);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createLink(req, res) {
        try {
            const link = await SocialLink.create(req.body);
            res.status(201).json(link);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateLink(req, res) {
        try {
            const link = await SocialLink.update(req.params.id, req.body);
            res.json(link);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteLink(req, res) {
        try {
            await SocialLink.delete(req.params.id);
            res.json({ message: "Social link deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = SocialLinksController;
