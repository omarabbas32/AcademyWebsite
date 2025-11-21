const mongoose = require('mongoose');

// Define the structure (schema) for the "About Us" sections
const aboutSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the section.'], // Title is mandatory
        trim: true // Removes any whitespace from the beginning and end
    },
    content: {
        type: String,
        required: [true, 'Please provide content for the section.'] // Content is mandatory
    }
}, {
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Create the model from the schema
const AboutSection = mongoose.model('AboutSection', aboutSectionSchema);

module.exports = AboutSection;

