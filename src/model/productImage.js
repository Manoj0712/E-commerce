// models/productImage.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define the ProductImage model
const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'product_images',
});

module.exports = ProductImage;
 