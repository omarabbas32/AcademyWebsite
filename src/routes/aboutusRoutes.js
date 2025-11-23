const express = require('express');
const router = express.Router();
const {
  getAboutSections,
  createAboutSection,
  updateAboutSection
} = require('../controllers/aboutusController.js');

// GET route to fetch all sections for the public website
router.get('/', getAboutSections);

// POST route to create a new section (for an admin)
router.post('/', createAboutSection);

// PUT route to update a section by its ID (for an admin)
router.put('/:id', updateAboutSection);

module.exports = router;
