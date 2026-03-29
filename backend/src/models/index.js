const sequelize = require('../config/db');
const User = require('./User');
const Plan = require('./Plan');
const PlanMember = require('./PlanMember');
const Activity = require('./Activity');
const Task = require('./Task');
const InviteLink = require('./InviteLink');
const Itinerary = require('./Itinerary');
const ItineraryDay = require('./ItineraryDay');

// User <-> Plan (creator)
User.hasMany(Plan, { foreignKey: 'createdBy', as: 'createdPlans' });
Plan.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Plan <-> User through PlanMember
Plan.belongsToMany(User, { through: PlanMember, foreignKey: 'planId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Plan, { through: PlanMember, foreignKey: 'userId', otherKey: 'planId', as: 'plans' });

// Plan <-> PlanMember
Plan.hasMany(PlanMember, { foreignKey: 'planId', as: 'planMembers' });
PlanMember.belongsTo(Plan, { foreignKey: 'planId' });
PlanMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Plan <-> Activity
Plan.hasMany(Activity, { foreignKey: 'planId', as: 'activities' });
Activity.belongsTo(Plan, { foreignKey: 'planId' });

// User <-> Activity
User.hasMany(Activity, { foreignKey: 'userId' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Plan <-> Task
Plan.hasMany(Task, { foreignKey: 'planId', as: 'tasks' });
Task.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// User <-> Task (assignee)
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// User <-> Task (creator)
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'taskCreator' });

// Plan <-> InviteLink
Plan.hasMany(InviteLink, { foreignKey: 'planId', as: 'inviteLinks' });
InviteLink.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// User <-> InviteLink (creator)
User.hasMany(InviteLink, { foreignKey: 'createdBy', as: 'createdInvites' });
InviteLink.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Plan <-> Itinerary
Plan.hasOne(Itinerary, { foreignKey: 'planId', as: 'itinerary' });
Itinerary.belongsTo(Plan, { foreignKey: 'planId' });

// User <-> Itinerary (acceptedBy)
User.hasMany(Itinerary, { foreignKey: 'acceptedBy' });
Itinerary.belongsTo(User, { foreignKey: 'acceptedBy', as: 'acceptor' });

// Itinerary <-> ItineraryDay
Itinerary.hasMany(ItineraryDay, { foreignKey: 'itineraryId', as: 'days', onDelete: 'CASCADE' });
ItineraryDay.belongsTo(Itinerary, { foreignKey: 'itineraryId' });

module.exports = {
  sequelize,
  User,
  Plan,
  PlanMember,
  Activity,
  Task,
  InviteLink,
  Itinerary,
  ItineraryDay,
};
