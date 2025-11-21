const AboutSection = require('../models/about.model.js');

// @desc    Get all "About Us" sections
// @route   GET /api/about
// @access  Public
const getAboutSections = async (req, res) => {
  try {
    const sections = await AboutSection.find({});
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};


const createAboutSection = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide both a title and content.' });
    }

    const newSection = await AboutSection.create({ title, content });
    res.status(201).json(newSection); // 201 means "Created"
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Update an existing "About Us" section
// @route   PUT /api/about/:id
// @access  Private (should be admin-only)
const updateAboutSection = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSection = await AboutSection.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Ensure new data matches schema
        });

        if (!updatedSection) {
            return res.status(404).json({ message: 'Section not found with this ID.' });
        }

        res.status(200).json(updatedSection);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
}


module.exports = {
  getAboutSections,
  createAboutSection,
  updateAboutSection
};
