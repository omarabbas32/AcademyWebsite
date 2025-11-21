const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true }, // e.g., "8 weeks", "3 months"
    instructor: { type: String, required: true },
    imagePath: { type: String }, // Course thumbnail/cover image
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    prerequisites: { type: String }, // Optional prerequisites
    syllabus: { type: String } // Course syllabus/outline
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
