const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if token exists
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, token missing",
            });
        }

        // Get token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        // Add user information to request
        req.user = decode;

        next()

    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token",
        });
    }
};

module.exports = protect;