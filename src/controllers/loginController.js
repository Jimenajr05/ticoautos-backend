const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
          { id: user._id, email: user.email }, 
          process.env.JWT_SECRET, 
          { expiresIn: '1h' }
        );

        return res.status(200).json({ 
          message: 'Login successful', 
          token,
          user: {
            id: user._id,
            name: user.name,
            lastName: user.lastName,
            age: user.age,
            phone: user.phone,
            email: user.email
          }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error logging in' });
    }
};

module.exports = login;