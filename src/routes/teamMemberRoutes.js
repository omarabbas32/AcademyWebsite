const express = require('express');
const router = express.Router();
const teamMemberController = require('../controllers/teamMemberController.js');
const { requireAuth, requireAdmin } = require('../middleware/auth.js');
const { upload, uploadToCloudinary, handleMulterError } = require('../middleware/upload.js');

// Public route - get all team members
router.get('/', teamMemberController.getAllTeamMembers);

// Public route - get single team member
router.get('/:id', teamMemberController.getTeamMemberById);

// Protected routes - require admin authentication
router.post('/',
    requireAdmin,
    upload.single('image'),
    handleMulterError,
    uploadToCloudinary,
    teamMemberController.createTeamMember
);

router.put('/:id',
    requireAdmin,
    upload.single('image'),
    handleMulterError,
    uploadToCloudinary,
    teamMemberController.updateTeamMember
);

router.delete('/:id',
    requireAdmin,
    teamMemberController.deleteTeamMember
);

module.exports = router;