const express = require('express');
const router = express.Router();

// Import route files
const profileRoutes = require('./profileRoutes');
const projectRoutes = require('./projectRoutes');
const skillRoutes = require('./skillsRoutes');
const profileSkillRoutes = require('./profileSkillsRoutes');
const socialLinksRoutes = require('./socialLinksRoutes');

// Register all routes
router.use('/profiles', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/profile-skills', profileSkillRoutes);
router.use('/social-links', socialLinksRoutes);

module.exports = router;
