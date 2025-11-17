const express = require('express');
const router = express.Router();
const SkillsController = require('../controllers/SkillsController');

// List all skills
router.get('/', SkillsController.getAllSkills);

// Create a new skill
router.post('/', SkillsController.createSkill);

// Delete a skill
router.delete('/:id', SkillsController.deleteSkill);

module.exports = router;
