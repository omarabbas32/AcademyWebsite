const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    jobTitle: { type: String, required: true },
    imagePath: { type: String, required: true }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);