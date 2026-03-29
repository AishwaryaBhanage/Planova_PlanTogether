const { Op } = require('sequelize');
const { InviteLink, Plan, PlanMember, User, Activity } = require('../models');

// Create invite link (admin only)
async function createInviteLink(req, res, next) {
  try {
    const { id: planId } = req.params;
    const { role, expiresInDays } = req.body;

    const membership = await PlanMember.findOne({
      where: { planId, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create invite links' });
    }

    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    const link = await InviteLink.create({
      planId,
      role: role || 'member',
      expiresAt,
      createdBy: req.user.id,
    });

    await Activity.create({
      planId,
      userId: req.user.id,
      action: 'created invite link',
      target: `${role || 'member'} role`,
    });

    res.status(201).json({
      inviteLink: {
        id: link.id,
        token: link.token,
        role: link.role,
        expiresAt: link.expiresAt,
        url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/join/${link.token}`,
        createdAt: link.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// List invite links for a plan (admin only)
async function getInviteLinks(req, res, next) {
  try {
    const { id: planId } = req.params;

    const membership = await PlanMember.findOne({
      where: { planId, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view invite links' });
    }

    const links = await InviteLink.findAll({
      where: { planId },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      inviteLinks: links.map((l) => ({
        id: l.id,
        token: l.token,
        role: l.role,
        expiresAt: l.expiresAt,
        expired: l.expiresAt && new Date(l.expiresAt) < new Date(),
        url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/join/${l.token}`,
        createdBy: l.creator?.name || 'Unknown',
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// Revoke invite link (admin only)
async function revokeInviteLink(req, res, next) {
  try {
    const { id: planId, linkId } = req.params;

    const membership = await PlanMember.findOne({
      where: { planId, userId: req.user.id },
    });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can revoke invite links' });
    }

    const deleted = await InviteLink.destroy({
      where: { id: linkId, planId },
    });
    if (!deleted) return res.status(404).json({ error: 'Invite link not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Get invite preview (PUBLIC — no auth required)
async function getInvitePreview(req, res, next) {
  try {
    const { token } = req.params;

    const link = await InviteLink.findOne({
      where: { token },
      include: [
        { model: Plan, as: 'plan', attributes: ['id', 'name', 'type', 'startDate', 'endDate', 'description'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
      ],
    });

    if (!link) return res.status(404).json({ error: 'Invite link not found' });
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'This invite link has expired' });
    }

    const memberCount = await PlanMember.count({ where: { planId: link.planId } });

    res.json({
      invite: {
        planName: link.plan.name,
        planType: link.plan.type,
        planDescription: link.plan.description,
        startDate: link.plan.startDate,
        endDate: link.plan.endDate,
        role: link.role,
        invitedBy: link.creator?.name || 'Someone',
        memberCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Accept invite (auth required)
async function acceptInvite(req, res, next) {
  try {
    const { token } = req.params;

    const link = await InviteLink.findOne({
      where: { token },
      include: [{ model: Plan, as: 'plan', attributes: ['id', 'name'] }],
    });

    if (!link) return res.status(404).json({ error: 'Invite link not found' });
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(410).json({ error: 'This invite link has expired' });
    }

    // Check if already a member
    const existing = await PlanMember.findOne({
      where: { planId: link.planId, userId: req.user.id },
    });
    if (existing) {
      return res.json({
        message: 'Already a member',
        planId: link.planId,
        alreadyMember: true,
      });
    }

    // Add as member
    await PlanMember.create({
      planId: link.planId,
      userId: req.user.id,
      role: link.role,
    });

    await Activity.create({
      planId: link.planId,
      userId: req.user.id,
      action: 'joined via invite link',
      target: link.plan.name,
    });

    res.json({
      message: 'Joined successfully',
      planId: link.planId,
      alreadyMember: false,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createInviteLink,
  getInviteLinks,
  revokeInviteLink,
  getInvitePreview,
  acceptInvite,
};
