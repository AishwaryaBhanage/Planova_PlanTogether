const express = require('express');
const authenticate = require('../middleware/auth');
const {
  getItinerary,
  generateItinerary,
  acceptItinerary,
  declineItinerary,
  updateDay,
  deleteDay,
  addDay,
} = require('../controllers/itineraryController');

const router = express.Router();

router.use(authenticate);

// Get itinerary for a plan
router.get('/:id/itinerary', getItinerary);

// AI generate itinerary (human-in-the-loop: generates draft)
router.post('/:id/itinerary/generate', generateItinerary);

// Accept AI-generated itinerary
router.post('/:id/itinerary/accept', acceptItinerary);

// Decline AI-generated itinerary
router.post('/:id/itinerary/decline', declineItinerary);

// Edit individual days (works on ai_generated or accepted)
router.post('/:id/itinerary/days', addDay);
router.put('/:id/itinerary/days/:dayId', updateDay);
router.delete('/:id/itinerary/days/:dayId', deleteDay);

module.exports = router;
