const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Organization = require('../models/Organization');

require('dotenv').config();

const router = express.Router();

// Route: register new user
router.post('/register', async (req, res) => {
    const { Organization_name, name, email, password, contact_number } = req.body;
  
    try {
      // Check if a customer with the given email already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Generate a random two-digit number
      const randomTwoDigitNumber = Math.floor(10 + Math.random() * 90);
  
      // Create the workspace name
      const workspaceName = `${Organization_name}${randomTwoDigitNumber}`;
  
      // Create a new customer and save to the database
      const newCustomer = new Customer({
        workspace:workspaceName,
        name,
        email,
        password,
        display_name: name,
        contact_number,
      });
      await newCustomer.save();
  
      // Create a new organization and save to the database
      const newOrganization = new Organization({
        Organization_name,
        workspace: workspaceName,
      });
      await newOrganization.save();
  
      res.status(200).json({ message: 'Customer registered successfully', workspace: workspaceName });
    } catch (error) {
      res.status(500).json({ message: 'Error registering customer', error: error.message });
    }
  });
  
// Route: Login and Generate Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
      // Query the database to find a matching email and password
      const loginCustomer = await Customer.findOne({ email, password });

      if (!loginCustomer) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
          {
              id: loginCustomer._id.toString(), // Convert ID to string
              email: loginCustomer.email,
              workspace: loginCustomer.workspace
          },
          process.env.JWT_SECRET,
          { expiresIn: '6h' }
      );

      // Set the data as response headers
      res.setHeader('token', token);
      res.setHeader('id', loginCustomer._id.toString());
      res.setHeader('email', loginCustomer.email);
      res.setHeader('workspace', loginCustomer.workspace);
      res.setHeader('Access-Control-Expose-Headers', 'token, id, email, workspace');

      res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
  }
});


module.exports = router;