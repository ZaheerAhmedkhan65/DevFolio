// controllers/PostCategoriesController.js
const PostCategory = require('../models/PostCategory');

class PostCategoriesController {
    static async list(req, res) {
        try {
            const cats = await PostCategory.findAll();
            if(req.user.role=='admin'){
                res.render('admin/posts/categories', { title: 'Post Categories', cats });
            }else{
            res.json(cats);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async get(req, res) {
        try {
            const cat = await PostCategory.findById(req.params.id);
            if (!cat) return res.status(404).json({ message: 'Category not found' });
            res.json(cat);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Admin-only: create
    static async create(req, res) {
        try {
            const { name, slug, description } = req.body;
            const created = await PostCategory.create({ name, slug, description });
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Admin-only: update
    static async update(req, res) {
        try {
            const updated = await PostCategory.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Admin-only: delete
    static async delete(req, res) {
        try {
            await PostCategory.delete(req.params.id);
            res.json({ message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = PostCategoriesController;
