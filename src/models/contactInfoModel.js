const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
    email: { type: String, required: true },
    phoneNumbers: [String], // An array to hold multiple numbers
    address: { type: String, required: true },
    socialMedia: [
        {
            platform: { type: String, required: true }, // e.g., 'Facebook', 'Instagram'
            url: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);