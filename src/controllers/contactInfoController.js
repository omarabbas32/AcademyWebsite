const ContactInfo = require('../models/contactInfoModel');

// GET the single contact info document
exports.getContactInfo = async (req, res) => {
    try {
        const info = await ContactInfo.findOne(); // findOne() gets the single document
        if (!info) {
            return res.status(404).json({ message: 'Contact information has not been set up yet.' });
        }
        res.status(200).json(info);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.createOrUpdateContactInfo = async (req, res) => {
    try {
        
        const updatedInfo = await ContactInfo.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
        res.status(200).json(updatedInfo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE the single contact info document
exports.deleteContactInfo = async (req, res) => {
    try {
        const deletedInfo = await ContactInfo.findOneAndDelete({});
        if (!deletedInfo) {
            return res.status(404).json({ message: 'Contact information not found.' });
        }
        res.status(200).json({ message: 'Contact information deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
