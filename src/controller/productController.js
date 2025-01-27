const Product = require('../model/product');
const User = require('../model/user');
const ProductVendor = require('../model/productVendor');
const ProductImage = require('../model/productImage');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, price, oldPrice, deliveryAmount, freeDelivery, startDate, expiryDate, vendorId } = req.body;
        const product = await Product.create({
            name,
            description,
            category,
            price,
            oldPrice,
            deliveryAmount,
            freeDelivery,
            startDate,
            expiryDate,
        });
        const productVendors = [];
        if (vendorId) {
            for (let vendor of vendorId) {
                console.log(vendor, "vendorvendor")
                const userIns = await User.findOne({ where: { email: vendor, role: 'vendor' }, });
                const productVendor = await assignVendorToProduct(product.id, userIns.id);
                productVendors.push(productVendor);
            }
        }
        const productItemIns = await Product.findByPk(product.id, {
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'], // Only fetch image_url
                }
            ]
        });
        console.log(productVendors, "productVendors")
        if (productVendors) {
            res.status(201).json({
                message: 'Product created successfully!',
                productItemIns,
                productVendors
            });
        } else {
            res.status(201).json({
                message: 'Product created successfully!',
                productItemIns,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error creating product',
            error: error.message,
        });
    }
};

exports.addVendor = async (req, res) => {
    const requestedRole = req.headers['role'];
    if (requestedRole == "staff" || requestedRole == "superAdmin") {
        const { id } = req.params;
        const product = await Product.findOne({ where: { id } });

        let vendors;
        if (req.body.vendorId) {
            for (let vendor of req.body.vendorId) {
                const userIns = await User.findOne({ where: { email: vendor, role: 'vendor' }, });
                let productVendor
                if (userIns) {
                    productVendor = await assignVendorToProduct(product.id, userIns.id);
                }

            }
            vendors = await productToVendorList(product.id);

        } else {
            return res.status(403).json({ message: 'vendor list empty' });
        }
        const productItemIns = await Product.findByPk(id, {
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'], // Only fetch image_url
                }
            ]
        });
        return res.status(403).json({ message: 'vendor add successfully', vendorList: vendors, productItemIns });

    } else {
        return res.status(403).json({ message: 'access denied' });
    }
}

const assignVendorToProduct = async (productId, vendorId) => {
    try {
        const vendor = await User.findByPk(vendorId);
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const productVendor = await ProductVendor.create({
            product_id: product.id,
            vendor_id: vendor.id,
        });

        return vendor
    } catch (error) {
        return error;
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: { id },
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'],
                },
            ],
        });

        const productToVendorIns = await productToVendorList(product.id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        if (productToVendorIns) {
            res.status(200).json({
                success: true,
                product,
                vendors: productToVendorIns
            });
        } else {
            res.status(200).json({
                success: true,
                data: product,
            });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
}
const productToVendorList = async (productItemId) => {
    const vendors = await ProductVendor.findAll({
        where: { product_id: productItemId }, // Filter by product_id
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'email', 'password', 'role'], // Adjust fields to your User model
            },
        ],
    });
    if (vendors) {
        return vendors.map((vendor) => vendor.User);;
    } else {
        return null;

    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const whereCondition = {};

        if (req.body.category) {
            whereCondition.category = req.body.category;
        }

        if (req.body.name) {
            whereCondition.name = { [Sequelize.Op.like]: `%${req.body.name}%` };
        }

        const products = await Product.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'],
                },
            ],
        });
        console.log(products, "products")
        const productsWithVendors = await Promise.all(
            products.rows.map(async (product) => {
                const vendors = await productToVendorList(product.id);
                return {
                    ...product.dataValues,
                    vendors: vendors || []
                };
            })
        );

        res.status(200).json({
            success: true,
            total: products.count,
            pages: Math.ceil(products.count / limit),
            data: productsWithVendors,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

exports.deleteProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, { transaction });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await ProductImage.destroy({
            where: { product_id: id },
            transaction,
        });

        await ProductVendor.destroy({
            where: { product_id: id },
            transaction,
        });

        await Product.destroy({
            where: { id },
            transaction,
        });

        await transaction.commit();

        res.status(200).json({ success: true, message: 'Product and related data deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;  // Product ID to update
    const { name, description, price, oldPrice, deliveryAmount, freeDelivery, category, startDate, expiryDate, vendorId } = req.body; // New product data
    const transaction = await sequelize.transaction();  // Start a transaction

    try {
        const product = await Product.findByPk(id); // Find the product by ID
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.update(
            {
                name,
                description,
                price,
                oldPrice,
                deliveryAmount,
                freeDelivery,
                category,
                startDate,
                expiryDate,
            },
            { transaction }
        );

        await ProductVendor.destroy({
            where: { product_id: id },
            transaction,
        });
        await transaction.commit();

        const productVendors = [];
        if (vendorId) {
            for (let vendor of vendorId) {
                console.log(vendor, "vendorvendor")
                const userIns = await User.findOne({ where: { email: vendor, role: 'vendor' }, });
                const productVendor = await assignVendorToProduct(product.id, userIns.id);
                productVendors.push(productVendor);
            }
        }
        console.log(productVendors, "productVendors")
        const productItemIns = await Product.findByPk(id, {
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'], // Only fetch image_url
                }
            ]
        });
        if (productVendors) {
            res.status(200).json({
                success: true,
                message: 'Product and vendors updated successfully',
                productItemIns,
                vendorList: productVendors
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Product and vendors updated successfully',
                productItemIns
            });
        }
    } catch (error) {
        await transaction.rollback();  // Rollback in case of any error
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
};

exports.getVendorBasedProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = id
        console.log(vendorId)
        const vendorProducts = await ProductVendor.findAll({
            where: { vendor_id: vendorId },
            attributes: ['product_id'], // Only fetch product_id
        });

        if (!vendorProducts.length) {
            return res.status(404).json({
                success: false,
                message: `No products found for vendor ID: ${vendorId}`,
            });
        }

        const productIds = vendorProducts.map((vp) => vp.product_id);
        console.log("productIds", productIds)
        const products = await Product.findAll({
            where: { id: productIds },
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url'], // Adjust based on your schema
                },
            ],
        });

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error('Error fetching products for vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products for vendor',
        });
    }

}
exports.uploadProductImages = async (req, res) => {
    try {
        const productId = req.body.id;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        const existingImages = await ProductImage.findAll({
            where: { product_id: productId },
        });

        if (existingImages && existingImages.length > 0) {
            // Delete image files from the server
            existingImages.forEach((image) => {
                const imagePath = path.join(__dirname, `../uploads/productImages/${productId}`, image.image_url.split('/').pop());
                // Check if the file exists and delete it
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
            // Remove existing image records from the database
            await ProductImage.destroy({ where: { product_id: productId } });
        }

        // Step 2: Save new images and their URLs in the database
        const imageUrls = req.files.map((file) => {
            return `/uploads/productImages/${productId}/${file.filename}`; // Generate the image URL
        });

        const imageRecords = imageUrls.map((url) => ({
            product_id: productId,
            image_url: url,
        }));

        await ProductImage.bulkCreate(imageRecords);
        const product = await Product.findByPk(productId, {
            include: [
                {
                    model: ProductImage,
                    attributes: ['image_url']
                }
            ]
        });
        const productToVendorIns = await productToVendorList(productId)
        if (productToVendorIns) {
            res.status(200).json({
                success: true,
                message: 'Images uploaded, old images removed, and new images saved successfully.',
                product,
                vendorId: productToVendorIns
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Images uploaded, old images removed, and new images saved successfully.',
                product
            });
        }
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images.',
        });
    }
};