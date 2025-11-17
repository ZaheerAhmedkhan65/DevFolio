const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const PostTagsController = require('../controllers/PostTagsController');
const PostCategoriesController = require('../controllers/PostCategoriesController');

router.get('/dashboard', AdminController.dashboardStats);
// post tags routes
router.get('/post_tags', PostTagsController.list);
router.post('/post_tags/', PostTagsController.create);
router.put('/post_tags/:id', PostTagsController.update);
router.delete('/post_tags/:id', PostTagsController.delete);


// post categories routes
router.get('/post_categories/', PostCategoriesController.list);
router.post('/post_categories/', PostCategoriesController.create);
router.put('/post_categories/:id',  PostCategoriesController.update);
router.delete('/post_categories/:id', PostCategoriesController.delete);

module.exports = router;