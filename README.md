# DevFolio

users
  ├── profiles (1:1)
  ├── projects (1:N)
  ├── posts (1:N)
  ├── comments (1:N)
  ├── likes (1:N)
  ├── follows (as follower) (1:N)
  ├── follows (as followed) (1:N)
  ├── notifications (as recipient) (1:N)
  ├── notifications (as actor) (1:N)
  ├── bookmarks (1:N)
  └── analytics views (1:N)

profiles
  ├── profile_sections (1:N)
  ├── profile_skills (M:N via profile_skills)
  ├── social_links (1:N)
  └── profile_views (1:N)

posts
  ├── post_category_relations (M:N)
  ├── post_tag_relations (M:N)
  ├── comments (1:N via comment_relations)
  ├── likes (1:N)
  └── post_views (1:N)

projects
  ├── comments (1:N via comment_relations)
  ├── likes (1:N)
  └── project_views (1:N)

skills
  └── profile_skills (M:N via profile_skills)



Example Queries for New Features
1. Get Popular Posts with Like Count

  SELECT 
    p.*,
    u.username,
    u.profile_picture_url,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN likes l ON l.entity_type = 'post' AND l.entity_id = p.id
LEFT JOIN comment_relations cr ON cr.entity_type = 'post' AND cr.entity_id = p.id
LEFT JOIN comments c ON c.id = cr.comment_id AND c.status = 'approved'
WHERE p.status = 'published' AND p.published_at <= NOW()
GROUP BY p.id
ORDER BY like_count DESC, p.published_at DESC
LIMIT 10;

2. Get User Feed (Posts from Followed Users)

SELECT 
    p.*,
    u.username,
    u.profile_picture_url,
    COUNT(DISTINCT l.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN follows f ON f.followed_id = p.user_id
LEFT JOIN likes l ON l.entity_type = 'post' AND l.entity_id = p.id
LEFT JOIN comment_relations cr ON cr.entity_type = 'post' AND cr.entity_id = p.id
LEFT JOIN comments c ON c.id = cr.comment_id AND c.status = 'approved'
WHERE f.follower_id = ? -- current user id
    AND p.status = 'published' 
    AND p.published_at <= NOW()
GROUP BY p.id
ORDER BY p.published_at DESC
LIMIT 20;

3. Get Profile Analytics

SELECT 
    p.display_name,
    COUNT(DISTINCT pv.id) as total_views,
    COUNT(DISTINCT pv.viewer_id) as unique_viewers,
    COUNT(DISTINCT f.id) as followers_count,
    COUNT(DISTINCT pr.id) as projects_count
FROM profiles p
LEFT JOIN profile_views pv ON pv.profile_id = p.id
LEFT JOIN follows f ON f.followed_id = p.user_id
LEFT JOIN projects pr ON pr.user_id = p.user_id
WHERE p.user_id = ?
GROUP BY p.id;

4. Get User Notifications

SELECT 
    n.*,
    a.username as actor_username,
    a.profile_picture_url as actor_avatar
FROM notifications n
JOIN users a ON n.actor_id = a.id
WHERE n.user_id = ? AND n.is_read = FALSE
ORDER BY n.created_at DESC
LIMIT 20;


When implementing these features, you can:

Start with the core tables (posts, comments, likes, follows)

Add analytics tables later

Implement custom sections when needed

Add notifications and bookmarks as bonus features

This expanded schema provides a solid foundation for a full-featured developer portfolio platform that can compete with established platforms like Dev.to, Hashnode, or personal portfolio sites!