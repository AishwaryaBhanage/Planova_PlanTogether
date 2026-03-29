const { Task, User, Plan, PlanMember, Activity } = require('../models');

async function verifyMembership(planId, userId) {
  const member = await PlanMember.findOne({ where: { planId, userId } });
  return member;
}

async function getTasks(req, res, next) {
  try {
    const { id } = req.params;
    const member = await verifyMembership(id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Not a member of this plan' });

    const tasks = await Task.findAll({
      where: { planId: id },
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { id } = req.params;
    const member = await verifyMembership(id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Not a member of this plan' });

    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const task = await Task.create({
      planId: id,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      createdBy: req.user.id,
    });

    // Reload with assignee
    const fullTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
    });

    // Log activity
    await Activity.create({
      planId: id,
      userId: req.user.id,
      action: 'added task',
      target: title,
    });

    res.status(201).json({ task: fullTask });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id, taskId } = req.params;
    const member = await verifyMembership(id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Not a member of this plan' });

    const task = await Task.findOne({ where: { id: taskId, planId: id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const oldStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assigneeId !== undefined) task.assigneeId = assigneeId || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    // Log status change activity
    if (status && status !== oldStatus) {
      await Activity.create({
        planId: id,
        userId: req.user.id,
        action: status === 'done' ? 'completed task' : 'updated task',
        target: task.title,
      });
    }

    const fullTask = await Task.findByPk(task.id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }],
    });

    res.json({ task: fullTask });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id, taskId } = req.params;
    const member = await verifyMembership(id, req.user.id);
    if (!member) return res.status(403).json({ error: 'Not a member of this plan' });

    const task = await Task.findOne({ where: { id: taskId, planId: id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const taskTitle = task.title;
    await task.destroy();

    await Activity.create({
      planId: id,
      userId: req.user.id,
      action: 'deleted task',
      target: taskTitle,
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Get all tasks across all plans for the current user
async function getMyTasks(req, res, next) {
  try {
    const memberships = await PlanMember.findAll({
      where: { userId: req.user.id },
      attributes: ['planId'],
    });
    const planIds = memberships.map((m) => m.planId);

    const tasks = await Task.findAll({
      where: { planId: planIds },
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Plan, as: 'plan', attributes: ['id', 'name', 'type'] },
      ],
      order: [['dueDate', 'ASC NULLS LAST'], ['createdAt', 'DESC']],
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, getMyTasks };
