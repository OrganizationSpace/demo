// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Get the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (token === null) return res.sendStatus(401)
    try {
        const tokenResult = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenResult) {
            req.email = tokenResult.email; // Attach the email to the request object
            req.workspace = tokenResult.workspace;
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(400).json({ message: 'Invalid token' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
  };

module.exports = verifyToken;


















