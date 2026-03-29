const express = require('express');
const authenticate = require('../middleware/auth');
const {
  getInvitePreview,
  acceptInvite,
} = require('../controllers/inviteController');

const router = express.Router();

// Public — no auth needed to preview
router.get('/:token', getInvitePreview);

// Auth required to accept
router.post('/:token/accept', authenticate, acceptInvite);

module.exports = router;
