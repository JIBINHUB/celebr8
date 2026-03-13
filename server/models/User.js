const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    whatsapp: { type: DataTypes.STRING },
    marketingOptIn: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = User;
