const User = require('../models/User');
const Post = require('../models/Post');
const PostCategory = require('../models/PostCategory');
const PostTag = require('../models/PostTag');
const PostCategoryRelation = require('../models/PostCategoryRelation');
const PostTagRelation = require('../models/PostTagRelation');

class AdminController{
    static async dashboardStats(req, res) {
        try {
            const userCount = await User.countAll();
            const postCount = await Post.countAll();
            const categoryCount = await PostCategory.countAll();
            const tagCount = await PostTag.countAll();

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: {
                    users: userCount,
                    posts: postCount,
                    categories: categoryCount,
                    tags: tagCount
                }
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = AdminController;