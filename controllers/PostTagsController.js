// controllers/PostTagsController.js
const PostTag = require('../models/PostTag');

class PostTagsController {
    static async list(req, res) {
        try {
            const tags = await PostTag.findAll();
            if(req.user.role=='admin'){
                res.render('admin/posts/tags', { title: 'Post Tags', tags });
            }else{
                res.json(tags);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async get(req, res) {
        try {
            const tag = await PostTag.findById(req.params.id);
            if (!tag) return res.status(404).json({ message: 'Tag not found' });
            res.json(tag);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Admin-only
    static async create(req, res) {
        try {
            const { name, slug } = req.body;
            const created = await PostTag.create({ name, slug });
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const updated = await PostTag.update(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await PostTag.delete(req.params.id);
            res.json({ message: 'Tag deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = PostTagsController;
