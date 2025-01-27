const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductImage = require('./productImage');

// Define the Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }, 
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  oldPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  deliveryAmount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  freeDelivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  startDate: {
    type: DataTypes.DATE, 
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'products',
});

Product.hasMany(ProductImage, { foreignKey: 'product_id' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = Product;
