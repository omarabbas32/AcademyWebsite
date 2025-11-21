const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true  },
    brief: { type: String, required: true },
    solution: { type: String, required: true },
    results: { type: String, required: true }
});

module.exports = mongoose.model('Project', projectSchema);