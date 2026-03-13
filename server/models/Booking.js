const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        defaultValue: 'pending'
    },
    stripeSessionId: { type: DataTypes.STRING }
}, {
    indexes: [
        { fields: ['status'] },          // Fast confirmed-only queries
        { fields: ['eventId'] },         // Fast per-event booking lookups
        { fields: ['userId'] },          // Fast per-user booking lookups
        { fields: ['status', 'eventId'] } // Combined dashboard queries
    ]
});

module.exports = Booking;
