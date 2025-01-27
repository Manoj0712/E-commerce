const User = require('../model/user'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (role != 'staff') {
            return res.status(500).json({
                message: 'role only allow staff',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'staff';
        const newUser = await User.create({
            name,
            email,
            password:hashedPassword,
            role: userRole,
        });

        res.status(201).json({
            message: 'User created successfully',
            user: newUser,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message || error,
        });
    }
};

// Get a list of all users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                role: 'staff'
            },
            order: [['id', 'DESC']],
        });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching users',
            error: error.message || error,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user',
            error: error.message || error,
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        if (role != 'staff') {
            return res.status(201).json({
                message: 'role only allow staff',
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        console.log(name)

        user.name = name || user.name;
        user.email = email || user.email;
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword || user.password;  // You should hash the password before saving
        user.role = role || user.role;
        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error updating user',
            error: error.message || error,
        });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error deleting user',
            error: error.message || error,
        });
    }
};
