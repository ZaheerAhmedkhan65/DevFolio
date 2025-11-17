// routes/postCategories.routes.js
const express = require('express');
const router = express.Router();
const PostCategoriesController = require('../controllers/PostCategoriesController');

router.get('/', PostCategoriesController.list);
router.get('/:id', PostCategoriesController.get);

module.exports = router;
