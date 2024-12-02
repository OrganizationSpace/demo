// middleware/verifyToken.js

//Import necessary libraries
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

//Define the middleware function
const verifyToken = (req, res, next) => {  

  // Get the Authorization header
  const authHeader = req.headers['authorization']; 

  // Extract the token from the Authorization header
  const token = authHeader && authHeader.split(' ')[1]; //extract only token from Authorization header   

  // Check if no token is present
  if (token === null) return res.sendStatus(401);  

  try {
    // Verify the token with the JWT_SECRET from the environment
    const tokenResult = jwt.verify(token, process.env.JWT_SECRET);  

    // If token is valid, add user details to the request object
    if (tokenResult) {
        req.email = tokenResult.email; // Attach the decoded 'email' from the token to the request object
        req.workspace = tokenResult.workspace; // Attach the decoded 'workspace' from the token to the request object
        next(); // Pass control to the next middleware or route handler in the stack
    } else {
        return res.status(400).json({ message: 'Invalid token' });  
    }
  } catch (error) {
    //Catch any errors related to the token verification process
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });  
  }

};

//Export the middleware function
module.exports = verifyToken; 
