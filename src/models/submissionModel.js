const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
    {
        questionIndex: Number,
        selectedIndex: Number
    },
    { _id: false }
);

const submissionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Made optional for anonymous
        exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
        answers: [answerSchema],
        score: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }, // Score percentage
        passed: { type: Boolean, default: false }, // Whether student passed

        // Anonymous submission fields
        anonymousName: { type: String },
        anonymousEmail: { type: String }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
