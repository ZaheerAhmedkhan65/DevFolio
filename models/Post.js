// models/Post.js
const db = require('../config/db');

class Post {
    static async findById(id) {
        const [rows] = await db.query(`
        SELECT 
            p.*,
            ANY_VALUE(pr.display_name) AS display_name,
            ANY_VALUE(pr.profile_picture_url) AS profile_picture_url,
            ANY_VALUE(u.username_slug) AS username_slug,
            GROUP_CONCAT(DISTINCT t.name) AS tags,
            GROUP_CONCAT(DISTINCT t.slug) AS tag_slugs
        FROM posts p
        LEFT JOIN profiles pr ON pr.user_id = p.user_id
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN post_tag_relations pt ON pt.post_id = p.id
        LEFT JOIN post_tags t ON t.id = pt.tag_id
        WHERE p.id = ?
        GROUP BY p.id
        LIMIT 1
    `, [id]);

        const post = rows[0];
        if (!post) return null;

        // Convert tag strings to arrays
        post.tags = post.tags ? post.tags.split(',') : [];
        post.tag_slugs = post.tag_slugs ? post.tag_slugs.split(',') : [];

        return post;
    }


    static async countAll() {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM posts');
        return rows[0].count;
    }

    static async findBySlug(slug) {
        const [rows] = await db.query('SELECT * FROM posts WHERE slug = ?', [slug]);
        return rows[0];
    }

    static async create({
        user_id,
        title,
        slug,
        content,
        featured_image_url = null,
        status = 'draft',
        is_featured = false,
        read_time = 5
    }) {
        const [result] = await db.query(
            `INSERT INTO posts 
            (user_id, title, slug, content, featured_image_url, status, is_featured, read_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user_id, title, slug, content, featured_image_url, status, is_featured, read_time]
        );
        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowed = ['title', 'slug', 'content', 'featured_image_url', 'status', 'is_featured', 'read_time', 'published_at'];
        const fields = [];
        const values = [];

        for (const [k, v] of Object.entries(updates)) {
            if (allowed.includes(k)) {
                fields.push(`${k} = ?`);
                values.push(v);
            }
        }
        values.push(id);

        if (fields.length === 0) return this.findById(id);

        await db.query(`UPDATE posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
        return this.findById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
    }

    static async incrementViewCount(id) {
        await db.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [id]);
    }

    static async getTagsForPosts(postIds) {
        if (postIds.length === 0) return {};

        const [rows] = await db.query(
            `SELECT pt.id AS tag_id, pt.name AS tag_name, pt.slug AS tag_slug, ptr.post_id
             FROM post_tags pt
             JOIN post_tag_relations ptr ON ptr.tag_id = pt.id
             WHERE ptr.post_id IN (?)`, [postIds]
        );

        const postTagsMap = {};
        postIds.forEach(id => {
            postTagsMap[id] = [];
        });

        rows.forEach(row => {
            postTagsMap[row.post_id].push({
                id: row.tag_id,
                name: row.tag_name,
                slug: row.tag_slug
            });
        });

        return postTagsMap;
    }

    static async list({
        page = 1,
        perPage = 10,
        status = 'published',
        userId = null,
        categoryId = null,
        tagId = null,
        search = null
    } = {}) {
        const offset = (page - 1) * perPage;

        let base = `
        SELECT 
            p.*,
            ANY_VALUE(pr.display_name) AS display_name,
            ANY_VALUE(pr.profile_picture_url) AS profile_picture_url,
            ANY_VALUE(u.username_slug) AS username_slug,
            GROUP_CONCAT(DISTINCT t.name) AS tags,
            GROUP_CONCAT(DISTINCT t.slug) AS tag_slugs
        FROM posts p
        LEFT JOIN profiles pr ON pr.user_id = p.user_id
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN post_tag_relations pt ON pt.post_id = p.id
        LEFT JOIN post_tags t ON t.id = pt.tag_id
    `;

        const joins = [];
        const where = [];
        const params = [];

        if (categoryId) {
            joins.push('JOIN post_category_relations pc ON pc.post_id = p.id');
            where.push('pc.category_id = ?');
            params.push(categoryId);
        }

        if (tagId) {
            joins.push('JOIN post_tag_relations pt2 ON pt2.post_id = p.id');
            where.push('pt2.tag_id = ?');
            params.push(tagId);
        }

        if (status) {
            where.push('p.status = ?');
            params.push(status);
        }

        if (userId) {
            where.push('p.user_id = ?');
            params.push(userId);
        }

        if (search) {
            where.push('(p.title LIKE ? OR p.content LIKE ?)');
            const q = `%${search}%`;
            params.push(q, q, q);
        }

        const sql = [
            base,
            joins.join(' '),
            where.length ? `WHERE ${where.join(' AND ')}` : '',
            `GROUP BY p.id`,
            `ORDER BY p.is_featured DESC, p.published_at DESC, p.created_at DESC`,
            `LIMIT ? OFFSET ?`
        ].join(' ');

        params.push(perPage, offset);

        const [rows] = await db.query(sql, params);

        rows.forEach(post => {
            post.tags = post.tags ? post.tags.split(',') : [];
            post.tag_slugs = post.tag_slugs ? post.tag_slugs.split(',') : [];
        });

        return rows;
    }

}

module.exports = Post;
