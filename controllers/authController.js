const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered',
                redirectToLogin: true
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            role: "admin",
            email,
            password: hashedPassword,
        });


        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Failed to register user. Please try again later.' });
    }
};
// Guest register
exports.guestRegister = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered',
                redirectToLogin: true
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            role: "guest",
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Failed to register user. Please try again later.' });
    }
};

// Login Controller

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found, please register" });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token valid for 1 day
        );

        res.status(200).json({
            token,
            userRole: user.role,
            userId: user._id,
            message: "Login successful",
        });

    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};

