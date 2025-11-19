const User = require('../models/User');
const Profile = require('../models/Profile');
const ProfileSkill = require('../models/ProfileSkill');
const ProfileSection = require('../models/ProfileSection');
const SocialLink = require('../models/SocialLink');
const Post = require('../models/Post');
const PostTag = require('../models/PostTag');
const Skill = require('../models/Skill');

class UserController {
    static async list(req, res) {
        try {
            const users = await User.findAll();``
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async dashboard(req, res) {
        try {
            const profile = await Profile.findByUserId(req.user.userId);
            const drafPosts = await Post.list({ user_id: profile.id, status: 'draft' });
            const publishedPosts = await Post.list({ user_id: profile.id, status: 'published' });
            const posts = { draft: drafPosts, published: publishedPosts };
            res.render('public/users/dashboard', { title: profile.display_name + "'s Dashboard", profile, posts });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async get(req, res) {
        try {
            const user = await User.findByUsernameSlug(req.params.username_slug);
            if (!user) return res.status(404).json({ message: 'User not found' });

            const profile = await Profile.findByUserId(user.id);
            if (!profile) return res.status(404).json({ message: 'User not found' });

            const drafPosts = await Post.list({ user_id: profile.id, status: 'draft' });
            const publishedPosts = await Post.list({ user_id: profile.id, status: 'published' });
            const posts = { draft: drafPosts, published: publishedPosts };
            res.render('public/users/profile', { title: profile.display_name + "'s Profile", profile, posts, profile_user: user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Admin-only
    static async create(req, res) {
        try {
            const { username, email, password_hash, role } = req.body;
            const created = await User.create({ username, email, password_hash, role });
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await User.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await User.delete(req.params.id);
            res.json({ message: 'User deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async editProfile(req, res) {
        try {
            const profile = await Profile.findByUserId(req.user.userId);
            let profileSkills = await ProfileSkill.findByProfileId(profile.id);
            const skills = await Skill.findAll();
            const profileSections = await ProfileSection.findByProfileId(profile.id);
            const socialLinks = await SocialLink.findByProfileId(profile.id);
            res.render('public/users/edit_profile', { title: profile.display_name + "'s Profile", profile, profileSkills, skills, socialLinks, profileSections });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateProfile(req, res) {
        try {
            let updateData = req.body;

            // Handle Cloudinary uploaded image
            if (req.cloudinaryResult) {
                updateData.profile_picture_url = req.cloudinaryResult.secure_url;
            }

            updateData.is_public = req.body.is_public === 'on' ? 1 : 0;

            const updated = await Profile.update(req.user.userId, updateData);
            res.json({ success: true, data: updated });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


}

module.exports = UserController;