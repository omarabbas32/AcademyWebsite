const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController.js');

// Route for /api/projects
router.route('/')
    .get(projectController.getAllProjects)
    .post(projectController.createProject);

// Route for /api/projects/:id
router.route('/:id')
    .get(projectController.getProjectById)
    .put(projectController.updateProject)
    .delete(projectController.deleteProject);

// Export the router so it can be used in your main server file
module.exports = router;