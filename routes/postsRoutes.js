// routes/posts.routes.js
const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/PostsController');
const { authenticate, isAdmin } = require('../middlewares/authenticate');

// Public endpoints
router.get('/', PostsController.list);               // list with query filters
router.get('/create', authenticate, PostsController.showCreateForm);
router.get('/:id', PostsController.getById);   // get by id
router.get('/slug/:slug', PostsController.getBySlug); // get by slug (friendly URL)

// Protected endpoints (any authenticated user can create)
router.post('/create', authenticate, PostsController.create);

// Update / delete only owner or admin (controller checks ownership)
router.put('/:id', authenticate, PostsController.update);
router.delete('/:id', authenticate, PostsController.delete);

// Publish/unpublish
router.post('/:id/status', authenticate, PostsController.setStatus);

module.exports = router;
