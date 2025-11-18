// controllers/PostsController.js
const Post = require('../models/Post');
const PostCategoryRelation = require('../models/PostCategoryRelation');
const PostTagRelation = require('../models/PostTagRelation');
const PostCategory = require('../models/PostCategory');
const PostTag = require('../models/PostTag');

/**
 * Helpers
 */
function slugify(text) {
    return String(text)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\- ]/g, '')    // remove invalid chars
        .replace(/\s+/g, '-')           // collapse whitespace and replace by -
        .replace(/\-+/g, '-')           // collapse dashes
        .slice(0, 300);
}

function makeExcerpt(content, length = 240) {
    if (!content) return '';
    const plain = content.replace(/<[^>]+>/g, ''); // strip HTML tags
    if (plain.length <= length) return plain;
    return plain.slice(0, length).trim().replace(/\s+\S*$/, '') + '...';
}

/**
 * Controller
 */
class PostsController {
    // public listing (with filters)
    static async list(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const status = req.query.status || 'published';
            const { categoryId, tagId, userId, search } = req.query;

            const posts = await Post.list({
                page, perPage, status, categoryId, tagId, userId, search
            });

            res.json(posts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async showCreateForm(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });

            const categories = await PostCategory.findAll();
            const tags = await PostTag.findAll();
            res.render('public/posts/_editor', {
                title: 'Create New Post',
                categories,
                tags,
                post : {},
                action: '/posts/create',
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // get by slug (friendly URL)

    static async getBySlug(req, res) {
        try {
            const post = await Post.findBySlug(req.params.slug);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            // increment view count asynchronously (don't await)
            Post.incrementViewCount(post.id).catch(console.error);

            // attach categories & tags
            const categories = await PostCategoryRelation.findCategoriesForPost(post.id);
            const tags = await PostTagRelation.findTagsForPost(post.id);

            res.json({ post, categories, tags });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getById(req, res) {
        try {
            if (!/^\d+$/.test(req.params.id)) {
                return res.status(400).json({ error: "Invalid ID" });
            }

            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });
            const categories = await PostCategoryRelation.findCategoriesForPost(post.id);
            const tags = await PostTagRelation.findTagsForPost(post.id);

            res.render('public/posts/show', {
                title: post.title,
                post,
                categories,
                tags
            })
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // any authenticated user can create
    static async  create(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });

            const {
                title, content, excerpt, featured_image_url,
                status = 'draft', is_featured = false, read_time = 5,
                category_ids = [], tag_ids = []
            } = req.body;
            
            const slugBase = slugify(title);
            // ensure uniqueness by suffix if necessary
            let slug = slugBase;
            let count = 0;
            while (await Post.findBySlug(slug)) {
                count += 1;
                slug = `${slugBase}-${count}`;
                if (count > 50) break;
            }

            const finalExcerpt = excerpt || makeExcerpt(content);

            const post = await Post.create({
                user_id: req.user.userId,
                title,
                slug,
                content,
                excerpt: finalExcerpt,
                featured_image_url,
                status,
                is_featured: true ?  1 : 0,
                read_time
            });

            // attach categories & tags (expect arrays of ids)
            if (Array.isArray(category_ids)) {
                for (const cid of category_ids) {
                    // verify category exists
                    const category = await PostCategory.findById(cid);
                    if (category) {
                        await PostCategoryRelation.add(post.id, cid);
                    }
                }
            }

            if (Array.isArray(tag_ids)) {
                for (const tid of tag_ids) {
                    const tag = await PostTag.findById(tid);
                    if (tag) {
                        await PostTagRelation.add(post.id, tid);
                    }
                }
            }

            res.status(201).json({ post });
        } catch (err) {
            console.error('Create post error:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // update: only owner or admin
    static async update(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });

            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            const isOwner = post.user_id === req.user.userId;
            const isAdmin = req.user.role === 'admin';
            if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

            const updates = { ...req.body };

            // If title changed, regenerate slug safely
            if (updates.title && updates.title !== post.title && !updates.slug) {
                const slugBase = slugify(updates.title);
                let slug = slugBase;
                let count = 0;
                while (await Post.findBySlug(slug)) {
                    count += 1;
                    slug = `${slugBase}-${count}`;
                    if (count > 50) break;
                }
                updates.slug = slug;
            }

            // If content changed and no explicit excerpt, regenerate excerpt
            if (updates.content && !updates.excerpt) {
                updates.excerpt = makeExcerpt(updates.content);
            }

            const updated = await Post.update(post.id, updates);

            // Optionally update category/tag relations if provided
            if (Array.isArray(req.body.category_ids)) {
                // remove all existing and add new ones (simple approach)
                const existingCats = await PostCategoryRelation.findCategoriesForPost(post.id);
                for (const c of existingCats) {
                    await PostCategoryRelation.remove(post.id, c.id);
                }
                for (const cid of req.body.category_ids) {
                    const category = await PostCategory.findById(cid);
                    if (category) await PostCategoryRelation.add(post.id, cid);
                }
            }

            if (Array.isArray(req.body.tag_ids)) {
                const existingTags = await PostTagRelation.findTagsForPost(post.id);
                for (const t of existingTags) {
                    await PostTagRelation.remove(post.id, t.id);
                }
                for (const tid of req.body.tag_ids) {
                    const tag = await PostTag.findById(tid);
                    if (tag) await PostTagRelation.add(post.id, tid);
                }
            }

            res.json({ post: updated });
        } catch (err) {
            console.error('Update post error:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // delete: owner or admin
    static async delete(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });

            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            const isOwner = post.user_id === req.user.userId;
            const isAdmin = req.user.role === 'admin';
            if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

            await Post.delete(post.id);
            res.json({ message: 'Post deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // quick publish/unpublish (owner or admin)
    static async setStatus(req, res) {
        try {
            if (!req.user) return res.status(401).json({ message: 'Authentication required' });

            const post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            const isOwner = post.user_id === req.user.userId;
            const isAdmin = req.user.role === 'admin';
            if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

            const { status } = req.body;
            const updates = { status };
            if (status === 'published') updates.published_at = new Date();

            const updated = await Post.update(post.id, updates);
            res.json({ post: updated });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = PostsController;
