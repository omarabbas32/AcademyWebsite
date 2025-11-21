const OfflineSite = require('../models/offlineSiteModel.js');

// CREATE a new offline site
exports.createOfflineSite = async (req, res) => {
    try {
        const site = new OfflineSite({
            name: req.body.name,
            nameAr: req.body.nameAr,
            address: req.body.address,
            city: req.body.city,
            phone: req.body.phone,
            email: req.body.email,
            mapLink: req.body.mapLink,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        const newSite = await site.save();
        res.status(201).json(newSite);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET all offline sites
exports.getAllOfflineSites = async (req, res) => {
    try {
        const sites = await OfflineSite.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(sites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET all offline sites (Admin - including inactive)
exports.getAllOfflineSitesAdmin = async (req, res) => {
    try {
        const sites = await OfflineSite.find().sort({ createdAt: -1 });
        res.status(200).json(sites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET a single offline site by ID
exports.getOfflineSiteById = async (req, res) => {
    try {
        const site = await OfflineSite.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Offline site not found' });
        }
        res.status(200).json(site);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE an offline site by ID
exports.updateOfflineSite = async (req, res) => {
    try {
        const updatedSite = await OfflineSite.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSite) {
            return res.status(404).json({ message: 'Offline site not found' });
        }
        res.status(200).json(updatedSite);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE an offline site by ID
exports.deleteOfflineSite = async (req, res) => {
    try {
        const site = await OfflineSite.findByIdAndDelete(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Offline site not found' });
        }
        res.status(200).json({ message: 'Offline site deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
