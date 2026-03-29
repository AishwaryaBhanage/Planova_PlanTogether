const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const { getMyTasks } = require('../controllers/taskController');

const router = express.Router();
router.use(authenticate);

// Global: get all tasks across all user's plans
router.get('/my', getMyTasks);

module.exports = router;
