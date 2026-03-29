const { Plan, PlanMember, Activity, User, Task } = require('../models');

async function createPlan(req, res, next) {
  try {
    const { name, type, description, startDate, endDate, features } = req.body;

    const plan = await Plan.create({
      name,
      type,
      description,
      startDate,
      endDate,
      features: features || [],
      createdBy: req.user.id,
    });

    await PlanMember.create({
      planId: plan.id,
      userId: req.user.id,
      role: 'admin',
    });

    await Activity.create({
      planId: plan.id,
      userId: req.user.id,
      action: 'created',
      target: plan.name,
    });

    res.status(201).json({
      message: 'Plan created',
      plan: {
        ...plan.toJSON(),
        memberCount: 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getPlans(req, res, next) {
  try {
    const memberships = await PlanMember.findAll({
      where: { userId: req.user.id },
      attributes: ['planId'],
    });

    const planIds = memberships.map((m) => m.planId);

    const plans = await Plan.findAll({
      where: { id: planIds },
      include: [
        {
          model: PlanMember,
          as: 'planMembers',
          attributes: ['id'],
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status'],
        },
      ],
      order: [['startDate', 'ASC']],
    });

    const result = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      type: plan.type,
      description: plan.description,
      startDate: plan.startDate,
      endDate: plan.endDate,
      features: plan.features,
      memberCount: plan.planMembers.length,
      tasksCompleted: plan.tasks.filter((t) => t.status === 'done').length,
      tasksTotal: plan.tasks.length,
      createdBy: plan.createdBy,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));

    res.json({ plans: result });
  } catch (err) {
    next(err);
  }
}

async function getPlan(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    const plan = await Plan.findByPk(req.params.id, {
      include: [
        {
          model: PlanMember,
          as: 'planMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

async function updatePlan(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update this plan' });
    }

    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, type, description, startDate, endDate, features } = req.body;
    await plan.update({ name, type, description, startDate, endDate, features });

    await Activity.create({
      planId: plan.id,
      userId: req.user.id,
      action: 'updated',
      target: plan.name,
    });

    res.json({ message: 'Plan updated', plan });
  } catch (err) {
    next(err);
  }
}

async function deletePlan(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete this plan' });
    }

    await Task.destroy({ where: { planId: req.params.id } });
    await Activity.destroy({ where: { planId: req.params.id } });
    await PlanMember.destroy({ where: { planId: req.params.id } });
    await Plan.destroy({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite members' });
    }

    const { email, role } = req.body;
    const userToAdd = await User.findOne({ where: { email } });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    const existing = await PlanMember.findOne({
      where: { planId: req.params.id, userId: userToAdd.id },
    });

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    const newMember = await PlanMember.create({
      planId: req.params.id,
      userId: userToAdd.id,
      role: role || 'member',
    });

    await Activity.create({
      planId: req.params.id,
      userId: req.user.id,
      action: 'invited',
      target: userToAdd.name,
    });

    res.status(201).json({
      message: 'Member added',
      member: {
        id: newMember.id,
        userId: userToAdd.id,
        name: userToAdd.name,
        email: userToAdd.email,
        role: newMember.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    if (req.params.userId === req.user.id) {
      const adminCount = await PlanMember.count({
        where: { planId: req.params.id, role: 'admin' },
      });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the only admin' });
      }
    }

    const deleted = await PlanMember.destroy({
      where: { planId: req.params.id, userId: req.params.userId },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getMembers(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    const members = await PlanMember.findAll({
      where: { planId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    res.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const membership = await PlanMember.findOne({
      where: { planId: req.params.id, userId: req.user.id },
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this plan' });
    }

    const activities = await Activity.findAll({
      where: { planId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      activities: activities.map((a) => ({
        id: a.id,
        action: a.action,
        target: a.target,
        user: a.user.name,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  addMember,
  removeMember,
  getMembers,
  getActivity,
};
