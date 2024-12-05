
const express = require('express'); // Import the Express framework
const { register, login } = require('../controllers/userController'); // Import the controller functions

const router = express.Router(); // Create an Express router instance

// Define the registration route
router.post('/register', register);

// Define the login route
router.post('/login', login);

module.exports = router;