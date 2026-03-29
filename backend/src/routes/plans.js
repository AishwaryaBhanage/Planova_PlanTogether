const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth');
const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  addMember,
  removeMember,
  getMembers,
  getActivity,
} = require('../controllers/planController');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  createInviteLink,
  getInviteLinks,
  revokeInviteLink,
} = require('../controllers/inviteController');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('type').isIn(['trip', 'birthday', 'event', 'conference', 'custom']).withMessage('Invalid plan type'),
    body('startDate').notEmpty().withMessage('Start date is required'),
  ],
  createPlan
);

router.get('/', getPlans);
router.get('/:id', getPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

router.post(
  '/:id/members',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  addMember
);
router.get('/:id/members', getMembers);
router.delete('/:id/members/:userId', removeMember);

router.get('/:id/activity', getActivity);

// Task routes within a plan
router.get('/:id/tasks', getTasks);
router.post(
  '/:id/tasks',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);
router.put('/:id/tasks/:taskId', updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);

// Invite link routes
router.post('/:id/invite-links', createInviteLink);
router.get('/:id/invite-links', getInviteLinks);
router.delete('/:id/invite-links/:linkId', revokeInviteLink);

module.exports = router;
