const mongoose = require('mongoose');

const offlineSiteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameAr: { type: String, required: true }, // Arabic name
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    mapLink: { type: String }, // Google Maps link
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('OfflineSite', offlineSiteSchema);
