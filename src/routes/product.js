const express = require('express');
const router = express.Router();
const { authorize } = require("../middleware/auth");
const upload = require('../middleware/multer'); 

const productController = require('../controller/productController.js');

router.post('/save', authorize("staff", "superAdmin", "vendor"), productController.createProduct);

router.put('/update/:id', authorize("staff", "superAdmin", "vendor"), productController.updateProduct);

router.delete('/delete/:id', authorize("staff", "superAdmin", "vendor"), productController.deleteProduct);

router.get('/show/:id', authorize("staff", "superAdmin", "vendor"), productController.getProductById);

router.get('/index', authorize("staff", "superAdmin", "vendor", "user"), productController.getAllProducts);

router.post('/addVendor/:id', authorize("staff", "superAdmin"), productController.addVendor);

router.get('/vendor/:id', authorize("staff", "superAdmin", "vendor"), productController.getVendorBasedProduct);

router.post('/imageSave', authorize("staff", "superAdmin", "vendor"),upload.array('images', 10), productController.uploadProductImages);

module.exports = router;
