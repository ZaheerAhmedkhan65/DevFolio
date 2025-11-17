const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');

// Get all projects for a user
router.get('/user/:userId', ProjectController.getProjects);

// Get specific project
router.get('/:id', ProjectController.getProject);

// Create project
router.post('/', ProjectController.createProject);

// Update project
router.put('/:id', ProjectController.updateProject);

// Delete project
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;
