const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/ProfileController');

// Get profile by user id
router.get('/:userId', ProfileController.getProfile);

// Create profile
router.post('/', ProfileController.createProfile);

// Update profile
router.put('/:id', ProfileController.updateProfile);

// Delete profile
router.delete('/:id', ProfileController.deleteProfile);

module.exports = router;
