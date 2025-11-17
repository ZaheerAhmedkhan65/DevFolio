const express = require('express');
const router = express.Router();
const SocialLinksController = require('../controllers/SocialLinksController');

// Get all links for a profile
router.get('/profile/:profileId', SocialLinksController.getLinks);

// Get single link
router.get('/:id', SocialLinksController.getLink);

// Add a social link
router.post('/', SocialLinksController.createLink);

// Update social link
router.put('/:id', SocialLinksController.updateLink);

// Delete a link
router.delete('/:id', SocialLinksController.deleteLink);

module.exports = router;
