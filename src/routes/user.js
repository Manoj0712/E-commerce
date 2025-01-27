// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Create a new user
router.post('/save', userController.createUser);

// Get a list of all users
router.get('/index', userController.getUsers);

// Get a specific user by ID
router.get('/show/:id', userController.getUserById);

// Update a specific user by ID
router.put('/update/:id', userController.updateUser);

// Delete a specific user by ID
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;
