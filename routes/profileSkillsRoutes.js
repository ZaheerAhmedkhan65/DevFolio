const express = require('express');
const router = express.Router();
const ProfileSkillsController = require('../controllers/ProfileSkillsController');

// Get all skills assigned to a profile
router.get('/:profileId', ProfileSkillsController.getSkills);

// Add a skill to profile
router.post('/add', ProfileSkillsController.addSkill);

// Update skill mapping (proficiency/order)
router.put('/:profile_id/:skill_id', ProfileSkillsController.updateSkill);

// Remove skill from profile
router.delete('/:profile_id/:skill_id', ProfileSkillsController.removeSkill);

module.exports = router;
