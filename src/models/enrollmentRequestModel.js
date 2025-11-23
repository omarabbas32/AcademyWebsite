const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    paymentProofUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    adminNote: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
enrollmentRequestSchema.index({ user: 1, course: 1 });
enrollmentRequestSchema.index({ status: 1 });

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);
