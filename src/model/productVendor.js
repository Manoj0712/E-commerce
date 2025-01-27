const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');  
const User = require('./user');        

const ProductVendor = sequelize.define('ProductVendor', {}, {
  timestamps: false,  
  tableName: 'product_vendor',
});

ProductVendor.belongsTo(Product, { foreignKey: 'product_id' });
ProductVendor.belongsTo(User, { foreignKey: 'vendor_id' });

module.exports = ProductVendor;
 