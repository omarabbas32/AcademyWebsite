const Service = require('../models/serviceModel');

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE a new service
exports.createService = async (req, res) => {
    const { name, description } = req.body;

    // Basic validation
    if (!name || !description) {
        return res.status(400).json({ message: 'Both name and description are required.' });
    }

    const service = new Service({
        name: name,
        description: description
    });

    try {
        const newService = await service.save();
        res.status(201).json(newService); // 201 means "Created"
    } catch (err) {
        res.status(400).json({ message: err.message }); // 400 for bad user input
    }
};
