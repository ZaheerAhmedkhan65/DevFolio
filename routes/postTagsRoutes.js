// routes/postTags.routes.js
const express = require('express');
const router = express.Router();
const PostTagsController = require('../controllers/PostTagsController');

router.get('/', PostTagsController.list);
router.get('/:id', PostTagsController.get);

module.exports = router;