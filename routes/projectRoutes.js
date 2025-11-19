const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/ProjectController');
const { uploadProjectImage, uploadToCloudinaryMiddleware } = require('../middlewares/upload');


// New project
router.get('/projects/new', ProjectController.newProject);

// Get specific project
router.get('/projects/:id', ProjectController.getProject);

// Create project
router.post('/projects/create', uploadProjectImage, uploadToCloudinaryMiddleware, ProjectController.createProject);

// Update project
router.put('/projects/:id/update', uploadProjectImage, uploadToCloudinaryMiddleware, ProjectController.updateProject);

// Delete project
router.delete('/projects/:id/delete', ProjectController.deleteProject);


// Get all projects for a user
router.get('/:username_slug/projects', ProjectController.getProjects);

module.exports = router;
