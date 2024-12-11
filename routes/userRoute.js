const express = require('express');// Import the Express framework
const userController = require('../controllers/userController');// Import the userController class to handle  logic for user registration and login.
const user = new userController()// Create an instance of the userController class to call its methods.

// Create an Express router instance to define and manage routes
const router = express.Router();

//Route: User Registration
router.post('/register', async (req, res) => // Define a POST route for '/register'
    {
    const { Organization_name, name, email, password, contact_number } = req.body; // Extract user details from the request body.

    try {
        // Call the 'registerUser' function from the 'user' object, passing the extracted details.
        const response = await user.registerUser({ Organization_name, name, email, password, contact_number });
        // Await the response which contains the result of the registration process.
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//Route: User Login
router.post('/login', async (req, res) =>  // Define a POST route for '/login'
    {
    const { email, password } = req.body; // Extract 'email' and 'password' from the request body.

     // Check if either 'email' or 'password' is missing in the request body.
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
            // Call the 'loginUser' function to authenticate the user and retrieve token, id, email, and workspace.
             const { token, id, email: customerEmail, workspace } = await user.loginUser({ email, password });
            // Destructure the returned object to assign these values.

            // Set headers with token and customer details to send response
            res.setHeader('token', token); 
            res.setHeader('id', id);
            res.setHeader('email', customerEmail);
            res.setHeader('workspace', workspace);
            res.setHeader('Access-Control-Expose-Headers', 'token, id, email, workspace'); // Allow headers to be exposed to client-side apps

        // Send the JSON response
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
// Export the router to make the routes available for use in other parts of the application.