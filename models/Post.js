// models/Post.js
const db = require('../config/db');

class Post {
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        return rows[0];
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
        excerpt = null,
        featured_image_url = null,
        status = 'draft',
        is_featured = false,
        read_time = 5
    }) {
        const [result] = await db.query(
            `INSERT INTO posts 
            (user_id, title, slug, content, excerpt, featured_image_url, status, is_featured, read_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user_id, title, slug, content, excerpt, featured_image_url, status, is_featured, read_time]
        );
        return this.findById(result.insertId);
    }

    static async update(id, updates) {
        const allowed = ['title','slug','content','excerpt','featured_image_url','status','is_featured','read_time','published_at'];
        const fields = [];
        const values = [];

        for (const [k,v] of Object.entries(updates)) {
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
            pr.display_name,
            pr.profile_picture_url,
            u.username_slug
        FROM posts p
        LEFT JOIN profiles pr ON pr.user_id = p.user_id
        LEFT JOIN users u ON u.id = p.user_id
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
        joins.push('JOIN post_tag_relations pt ON pt.post_id = p.id');
        where.push('pt.tag_id = ?');
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
        where.push('(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)');
        const q = `%${search}%`;
        params.push(q, q, q);
    }

    const sql = [
        base,
        joins.join(' '),
        where.length ? `WHERE ${where.join(' AND ')}` : '',
        'ORDER BY p.is_featured DESC, p.published_at DESC, p.created_at DESC',
        'LIMIT ? OFFSET ?'
    ].join(' ');

    params.push(perPage, offset);

    const [rows] = await db.query(sql, params);
    return rows;
}

}

module.exports = Post;
