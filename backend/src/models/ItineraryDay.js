const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ItineraryDay = sequelize.define('ItineraryDay', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  itineraryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activities: {
    type: DataTypes.JSON,
    defaultValue: [],
    // Each activity: { time, title, description, location, type, estimatedCost }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'itinerary_days',
  timestamps: true,
});

module.exports = ItineraryDay;
