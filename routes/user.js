const express = require('express');// Import the Express framework
const jwt = require('jsonwebtoken');// Import the JSON Web Token library
const Customer = require('../models/Customer');// Import the Customer model 
const Organization = require('../models/Organization');// Import the Organization model

// Load environment variables from the .env file into process.env
require('dotenv').config();

// Create an Express router instance to define and manage routes
const router = express.Router();


// Route: register new user
router.post('/register', async (req, res) => {//Define a POST route for customer registration
  const { Organization_name, name, email, password, contact_number } = req.body;  //Destructure required fields from the request body

  try {
      //Check if a customer with the given email already exists in the database
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
          //If email already exists, send a 400 Bad Request response
          return res.status(400).json({ message: 'Email already exists' });
      }

      //Generate a random two-digit number
      const randomTwoDigitNumber = Math.floor(10 + Math.random() * 90);

      //Create a unique workspace name by appending the random number to the organization name
      const workspaceName = `${Organization_name}${randomTwoDigitNumber}`;

      //Create a new customer instance with the provided and generated data
      const newCustomer = new Customer({
          workspace: workspaceName, // Assign the generated workspace name
          name,                     // Customer's name
          email,                    // Customer's email
          password,                 // Customer's password
          display_name: name,       // Display name for the customer
          contact_number,           // Customer's contact number
      });
      //Save the new customer to the database
      await newCustomer.save();

      //Create a new organization instance with the organization name and workspace
      const newOrganization = new Organization({
          Organization_name,         // Organization's name
          workspace: workspaceName,  // The same workspace name assigned to the customer
      });
      //Save the new organization to the database
      await newOrganization.save();

      //Send a 200 OK response indicating successful registration with the workspace name
      res.status(200).json({ message: 'Customer registered successfully'});
  } catch (error) {
      res.status(500).json({ message: 'Error registering customer', error: error.message });
  }
});

  
// Route: Login and Generate Token
router.post('/login', async (req, res) => {//Define a POST route for login and token generation

  const { email, password } = req.body;  //Destructure the email and password fields from the request body

  //Validate that both email and password fields are provided
  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
      //Query the database to find a customer with matching email and password
      const loginCustomer = await Customer.findOne({ email, password });

      //If no matching customer is found, return an error response
      if (!loginCustomer) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      //Extract the customer's ID and convert it to a string
      let id = loginCustomer._id.toString();

      //Generate a JWT token containing the customer's details
      const token = jwt.sign(
          {
              id,                             // Include the customer's ID
              email: loginCustomer.email,     // Include the customer's email
              workspace: loginCustomer.workspace // Include the customer's workspace
          },
          process.env.JWT_SECRET,           // Secret key from .env file
          { expiresIn: '6h' }               // Token expires in 6 hours
      );

      //Set response headers to include the token and customer details
      res.setHeader('token', token);                          // Add the JWT token
      res.setHeader('id', id);                                // Add the customer's ID
      res.setHeader('email', loginCustomer.email);            // Add the customer's email
      res.setHeader('workspace', loginCustomer.workspace);    // Add the customer's workspace
      res.setHeader('Access-Control-Expose-Headers', 'token, id, email, workspace'); // Allow headers to be exposed to client-side apps

      //Send a success response with the token
      res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

module.exports = router;