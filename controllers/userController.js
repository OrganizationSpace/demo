const Customer = require('../models/Customer');// Import the Customer model
const Organization = require('../models/Organization');// Import the Organization model
require('dotenv').config();// Load environment variables from the .env file into process.env
const jwt = require('jsonwebtoken');// Import the JSON Web Token library

// Define the userController class which handles user-related operations.
class userController {

    // Define an asynchronous function to handle user registration.
    async registerUser({ Organization_name, name, email, password, contact_number }) {
        try {
            // Check if a customer with the same email already exists in the database.
            const existingCustomer = await Customer.findOne({ email });
            if (existingCustomer) {
                throw new Error('Email already exists');
            }
    
            // Generate a random two-digit number between 10 and 99.
            const randomTwoDigitNumber = Math.floor(10 + Math.random() * 90);
            // Concatenate the organization name with the random number to create a unique workspace name.
            const workspaceName = `${Organization_name}${randomTwoDigitNumber}`;
    
             // Create a new customer instance with the provided details.
            const newCustomer = new Customer({
                workspace: workspaceName,
                name,
                email,
                password, 
                display_name: name,
                contact_number,
            });
            await newCustomer.save();
            // Save the new customer to the database.

            // Create a new organization instance with the organization name and workspace.
            const newOrganization = new Organization({
                Organization_name,
                workspace: workspaceName,
            });
            await newOrganization.save();
            // Save the new organization to the database.

            return { message: 'Customer registered successfully' };
        } catch (error) {
            throw new Error(error.message || 'An error occurred during registration');
        }
    }
    
    // Define an asynchronous function to handle user login.
    async loginUser({ email, password }) {
        try {
            // Attempt to find a customer in the database matching the provided email and plaintext password.
            const loginCustomer = await Customer.findOne({ email, password }); // Match plaintext password
            
            // Throw an error if the customer is not found or credentials are incorrect.
            if (!loginCustomer) {
                throw new Error('Invalid credentials');
            }

            // Convert the customer's MongoDB ObjectId to a string for easier use.
            const id = loginCustomer._id.toString();
            console.log("Id", id);

             // Generate a JWT token with the customer's details and a 6-hour expiration time.
            const token = jwt.sign(
                { _id: loginCustomer.id, email: loginCustomer.email, workspace: loginCustomer.workspace },
                process.env.JWT_SECRET,
                { expiresIn: '6h' }
            );

            // Return the token and user details for further use.
            return { token, id, email: loginCustomer.email, workspace: loginCustomer.workspace };
        } catch (error) {
            throw new Error(error.message || 'An error occurred during login');
        }
    }

   }

module.exports = userController ;  
// Export the userController class for use in other parts of the application.