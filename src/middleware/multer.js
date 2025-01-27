const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("req.body",req.body)
        const productId = req.body.id || req.params.id;
        if (!productId) {
            return cb(new Error('Product ID is required.'));
        }

        const uploadPath = path.join(__dirname, `../uploads/productImages/${productId}`);
        // Create the directory for product images if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

// File filter (if needed) to restrict file types (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
