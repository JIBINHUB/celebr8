const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
    qrCodeString: { type: DataTypes.STRING, unique: true, allowNull: false },
    status: {
        type: DataTypes.ENUM('valid', 'used', 'cancelled'),
        defaultValue: 'valid'
    },
    scannedAt: { type: DataTypes.DATE, allowNull: true }
}, {
    indexes: [
        { fields: ['qrCodeString'] },  // Fast QR code scan lookups
        { fields: ['bookingId'] },     // Fast booking join queries
        { fields: ['status'] }         // Fast check-in status filters
    ]
});

module.exports = Ticket;
