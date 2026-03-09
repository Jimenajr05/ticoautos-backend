const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, lastName, age, phone, email, password } = req.body;

    if (!name || !lastName || !age || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }  

    if (age < 18) {
        return res.status(400).json({ message: 'You must be at least 18 years old to register' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase(). trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }   

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileImage = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;

        const user = await User.create({
            name: name.trim(),
            lastName: lastName.trim(),
            age,
            phone: phone.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            profileImage
        });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ 
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                lastName: user.lastName,
                age: user.age,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

module.exports = register;