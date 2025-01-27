const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const allowedRoles = ['user', 'vendor'];
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'You are not allowed to sign up with this role only' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error creating user',
            error: error.message || error,
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid emailaddress' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'invaild password' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ token,...user.dataValues });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    } 
};  
