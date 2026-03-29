const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Itinerary = sequelize.define('Itinerary', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('empty', 'generating', 'ai_generated', 'accepted', 'declined'),
    defaultValue: 'empty',
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  acceptedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'itineraries',
  timestamps: true,
});

module.exports = Itinerary;
