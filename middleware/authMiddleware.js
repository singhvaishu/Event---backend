


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    let token = req.header('Authorization');

    console.log('Received Token:', token);


    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }


    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};


const guestUserRestrict = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Attach userId to request

        // Fetch user from database
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user role is "guest"
        if (user.role === "guest") {
            return res.status(403).json({ message: "Access denied. Guest users have limited access." });
        }

        req.user = user; // Attach user object to request
        next(); // Proceed to the next middleware

    } catch (error) {
        console.error("Guest User Restriction Middleware Error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};



module.exports = { authMiddleware, guestUserRestrict };
