const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  role: {
    type: DataTypes.ENUM('user', 'staff', 'superAdmin', 'vendor'),
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports  = User;
