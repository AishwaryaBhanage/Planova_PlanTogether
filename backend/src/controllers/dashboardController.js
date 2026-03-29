const { PlanMember, Activity, Plan, User } = require('../models');

async function getDashboard(req, res, next) {
  try {
    const memberships = await PlanMember.findAll({
      where: { userId: req.user.id },
      attributes: ['planId'],
    });

    const planIds = memberships.map((m) => m.planId);

    const activePlans = planIds.length;

    const recentActivity = await Activity.findAll({
      where: { planId: planIds },
      include: [
        { model: User, as: 'user', attributes: ['name'] },
        { model: Plan, attributes: ['name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      activePlans,
      pendingTasks: 0,
      unsettledExpenses: 0,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        target: a.target,
        user: a.user.name,
        planName: a.Plan.name,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
