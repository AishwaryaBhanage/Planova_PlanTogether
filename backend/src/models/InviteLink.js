const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InviteLink = sequelize.define('InviteLink', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('member', 'viewer'),
    defaultValue: 'member',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true, // null = never expires
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'invite_links',
  timestamps: true,
});

module.exports = InviteLink;
