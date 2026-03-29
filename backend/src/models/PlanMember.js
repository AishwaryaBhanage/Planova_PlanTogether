const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlanMember = sequelize.define('PlanMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member', 'viewer'),
    defaultValue: 'member',
  },
}, {
  tableName: 'plan_members',
  timestamps: true,
});

module.exports = PlanMember;
