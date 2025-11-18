// routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate, isAdmin } = require('../middlewares/authenticate');
const {uploadProfileImage, uploadToCloudinaryMiddleware } = require('../middlewares/upload');

// Public endpoints
router.get('/settings', UserController.editProfile);
router.post('/settings', authenticate, uploadProfileImage, uploadToCloudinaryMiddleware, UserController.updateProfile);
router.get('/:username_slug', UserController.get);


// Admin-only endpoints
router.get('/', authenticate, isAdmin, UserController.list);
router.post('/', authenticate, isAdmin, UserController.create);
router.put('/:id', authenticate, isAdmin, UserController.update);
router.delete('/:id', authenticate, isAdmin, UserController.delete);

module.exports = router;