const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        prompt: { type: String, required: true },
        options: {
            type: [String],
            validate: v => Array.isArray(v) && v.length >= 2,
            required: true
        },
        correctIndex: { type: Number, required: true }
    },
    { _id: false }
);

const examSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Link to course
        isPublished: { type: Boolean, default: false },
        questions: { type: [questionSchema], default: [] },
        duration: { type: Number }, // Duration in minutes
        passingScore: { type: Number, default: 60 }, // Passing percentage

        // Private exam fields
        isPrivate: { type: Boolean, default: false },
        accessToken: { type: String, unique: true, sparse: true }, // Unique token for private access
        allowAnonymous: { type: Boolean, default: false } // Allow taking without login
    },
    { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
