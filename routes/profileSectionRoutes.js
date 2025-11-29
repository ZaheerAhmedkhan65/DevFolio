const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');

const ProfileSectionController = require('../controllers/ProfileSectionController');

// Routes
router.get('/profiles/:profileId/sections', ProfileSectionController.getSections);

router.get('/profiles/:profileId/sections/public', ProfileSectionController.getPublicSections);

router.get('/sections/:id', ProfileSectionController.getSection);

router.post('/sections/add', authenticate, ProfileSectionController.createSection);

router.put('/sections/:id', authenticate, ProfileSectionController.updateSection);

router.delete('/sections/:id', authenticate, ProfileSectionController.deleteSection);

router.put(
    '/profiles/:profileId/sections/order', authenticate, ProfileSectionController.updateDisplayOrder
);

router.get('/profiles/:profileId/sections/count', ProfileSectionController.countSections);

module.exports = router;