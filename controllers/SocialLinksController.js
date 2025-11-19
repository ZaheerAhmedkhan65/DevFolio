const SocialLink = require('../models/SocialLink');
const Profile = require('../models/Profile');

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
            const { platform_name, platform_icon, url, display_order = 0 } = req.body;
            const profile = await Profile.findByUserId(req.user.userId);
            const link = await SocialLink.create({
                profile_id: profile.id,
                platform_name,
                platform_icon,
                url,
                display_order
            });
            res.status(201).redirect('/settings');
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
