const User = require('../models/User');
const Profile = require('../models/Profile');
const ProfileSkill = require('../models/ProfileSkill');
const ProfileSection = require('../models/ProfileSection');
const SocialLink = require('../models/SocialLink');
const Post = require('../models/Post');
const PostTag = require('../models/PostTag');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const ProfileView = require('../models/ProfileView');

class UserController {
    static async list(req, res) {
        try {
            const users = await User.findAll(); ``
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async dashboard(req, res) {
        try {
            const profile = await Profile.findByUserId(req.user.userId);
            const projectsCount = await Project.countByUserId(req.user.userId);
            const skillsCount = await ProfileSkill.countByProfileId(profile.id);
            res.render('public/users/dashboard', { title: profile.display_name + "'s Dashboard", profile, projectsCount, skillsCount });
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
            let profileSkills = await ProfileSkill.findByProfileId(profile.id);
            const drafPosts = await Post.list({ userId: user.id, status: 'draft' });
            const publishedPosts = await Post.list({ userId: user.id, status: 'published' });
            const posts = { draft: drafPosts, published: publishedPosts };
            const socialLinks = await SocialLink.findByProfileId(profile.id);
            if (req.user.userId !== user.id) {
                await ProfileView.addView(
                    profile.id,           // profile_id
                    req.user.userId,      // viewer_id
                    req.ip,               // viewer_ip
                    req.headers['user-agent'], // user_agent
                    req.get('referer')    // referrer
                );
            }
            res.render('public/users/profile', { title: profile.display_name + "'s Profile", profile, posts, profile_user: user, profileSkills, socialLinks });
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
            const updated = await User.updateUser(req.params.id, req.body);
            res.redirect('/');
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
            res.render('public/users/edit_profile', { title: profile.display_name + "'s Profile", profile, profileSkills, skills, socialLinks, profileSections, getProficiencyLevel, getSectionColor, getSectionIcon, formatDate });
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
            res.redirect('/'+updated[0].username_slug);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }


}

function getProficiencyLevel(proficiency) {
    switch (proficiency) {
        case 'Beginner':
            return 1;
        case 'Intermediate':
            return 2;
        case 'Advanced':
            return 3;
        case 'Expert':
            return 4;
        default:
            return 0;
    }
}

function getSectionColor(section_type) {
    switch (section_type) {
        case 'About':
            return 'blue';
        case 'Experience':
            return 'green';
        case 'Projects':
            return 'red';
        case 'Skills':
            return 'yellow';
        default:
            return 'gray';
    }
}

function getSectionIcon(section_type) {
    switch (section_type) {
        case 'About':
            return 'fas fa-user';
        case 'Experience':
            return 'fas fa-briefcase';
        case 'Projects':
            return 'fas fa-code';
        case 'Skills':
            return 'fas fa-cogs';
        default:
            return 'fas fa-question';
    }
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

module.exports = UserController;