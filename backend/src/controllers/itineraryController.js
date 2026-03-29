const { Plan, PlanMember, Itinerary, ItineraryDay, Activity } = require('../models');
const itineraryService = require('../services/itinerary.service');

// GET /api/plans/:id/itinerary
async function getItinerary(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    let itinerary = await Itinerary.findOne({
      where: { planId: req.params.id },
      include: [{ model: ItineraryDay, as: 'days', order: [['dayNumber', 'ASC']] }],
    });

    if (!itinerary) {
      itinerary = await Itinerary.create({ planId: req.params.id, status: 'empty' });
      itinerary.days = [];
    }

    res.json({ itinerary });
  } catch (err) {
    next(err);
  }
}

// POST /api/plans/:id/itinerary/generate
async function generateItinerary(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can generate itineraries' });
    }

    const plan = await Plan.findByPk(req.params.id, {
      include: [{ model: PlanMember, as: 'planMembers', attributes: ['id'] }],
    });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Find or create itinerary
    let itinerary = await Itinerary.findOne({ where: { planId: req.params.id } });
    if (!itinerary) {
      itinerary = await Itinerary.create({ planId: req.params.id });
    }

    // Set status to generating
    await itinerary.update({ status: 'generating' });

    // Clear old days if regenerating
    await ItineraryDay.destroy({ where: { itineraryId: itinerary.id } });

    // Call AI to generate
    const days = await itineraryService.generateItinerary({
      planName: plan.name,
      type: plan.type,
      description: plan.description,
      startDate: plan.startDate,
      endDate: plan.endDate,
      memberCount: plan.planMembers.length,
    });

    // Save generated days
    const savedDays = await Promise.all(
      days.map((day) =>
        ItineraryDay.create({
          itineraryId: itinerary.id,
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title,
          activities: day.activities,
          notes: day.notes,
        })
      )
    );

    await itinerary.update({ status: 'ai_generated', generatedAt: new Date() });

    await Activity.create({
      planId: req.params.id,
      userId: req.user.id,
      action: 'generated itinerary',
      target: plan.name,
    });

    res.json({
      message: 'Itinerary generated',
      itinerary: {
        ...itinerary.toJSON(),
        days: savedDays,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/plans/:id/itinerary/accept
async function acceptItinerary(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can accept itineraries' });
    }

    const itinerary = await Itinerary.findOne({
      where: { planId: req.params.id },
      include: [{ model: ItineraryDay, as: 'days' }],
    });

    if (!itinerary || itinerary.status !== 'ai_generated') {
      return res.status(400).json({ error: 'No AI-generated itinerary to accept' });
    }

    await itinerary.update({
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedBy: req.user.id,
    });

    await Activity.create({
      planId: req.params.id,
      userId: req.user.id,
      action: 'accepted itinerary',
      target: itinerary.days.length + ' day plan',
    });

    res.json({ message: 'Itinerary accepted', itinerary });
  } catch (err) {
    next(err);
  }
}

// POST /api/plans/:id/itinerary/decline
async function declineItinerary(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can decline itineraries' });
    }

    const itinerary = await Itinerary.findOne({ where: { planId: req.params.id } });
    if (!itinerary || itinerary.status !== 'ai_generated') {
      return res.status(400).json({ error: 'No AI-generated itinerary to decline' });
    }

    // Clear days and reset
    await ItineraryDay.destroy({ where: { itineraryId: itinerary.id } });
    await itinerary.update({ status: 'declined' });

    await Activity.create({
      planId: req.params.id,
      userId: req.user.id,
      action: 'declined itinerary',
      target: 'AI suggestion',
    });

    res.json({ message: 'Itinerary declined', itinerary });
  } catch (err) {
    next(err);
  }
}

// PUT /api/plans/:id/itinerary/days/:dayId
async function updateDay(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    const itinerary = await Itinerary.findOne({ where: { planId: req.params.id } });
    if (!itinerary || !['ai_generated', 'accepted'].includes(itinerary.status)) {
      return res.status(400).json({ error: 'Itinerary is not editable' });
    }

    const day = await ItineraryDay.findOne({
      where: { id: req.params.dayId, itineraryId: itinerary.id },
    });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const { title, activities, notes } = req.body;
    await day.update({
      ...(title !== undefined && { title }),
      ...(activities !== undefined && { activities }),
      ...(notes !== undefined && { notes }),
    });

    res.json({ message: 'Day updated', day });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/plans/:id/itinerary/days/:dayId
async function deleteDay(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete days' });
    }

    const itinerary = await Itinerary.findOne({ where: { planId: req.params.id } });
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    await ItineraryDay.destroy({
      where: { id: req.params.dayId, itineraryId: itinerary.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// POST /api/plans/:id/itinerary/days
async function addDay(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    const itinerary = await Itinerary.findOne({ where: { planId: req.params.id } });
    if (!itinerary || !['ai_generated', 'accepted'].includes(itinerary.status)) {
      return res.status(400).json({ error: 'Itinerary is not editable' });
    }

    const { dayNumber, date, title, activities, notes } = req.body;

    const day = await ItineraryDay.create({
      itineraryId: itinerary.id,
      dayNumber,
      date,
      title,
      activities: activities || [],
      notes,
    });

    res.status(201).json({ message: 'Day added', day });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItinerary,
  generateItinerary,
  acceptItinerary,
  declineItinerary,
  updateDay,
  deleteDay,
  addDay,
};
