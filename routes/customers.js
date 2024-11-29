// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Organization = require('../models/Organization');
const authorization = require('../functions/auth');

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
  
    try {
      // Find the customer by email
      const customer = await Customer.findOne({ email });
      if (!customer) return res.status(404).json({ message: 'Email not found' });
  
      // Check if the password matches 
      if (customer.password !== password) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Generate JWT token
      const token = jwt.sign({
         id: customer._id.toString(),//toString: that converts an object, number, array, or other data types into a string representation. 
         email:customer.email,
        workspace:customer.workspace },
          process.env.JWT_SECRET, { expiresIn: '1h' });
          
      // Set the data as a response header 
      res.setHeader('token',token)
      res.setHeader('id',customer._id.toString())
      res.setHeader('email', customer.email);
      res.setHeader('workspace', customer.workspace);


      res.setHeader('Access-Control-Expose-Headers', 'token, id, email');

      res.status(200).json({ message: 'Login successful' ,token});
    } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  });

//add customer
router.post('/add', authorization, async (req, res) => {
  const { name, email, display_name ,contact_number, dob } = req.body;

  try {
      // Check if a customer with the given email already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
          return res.status(400).json({ message: 'Email already exists' });
      }

      // Create a new customer
      const newCustomer = new Customer({
          workspace: req.workspace, // Get the workspace from the verified token
          name,
          email,
          display_name,
          contact_number,   
          dob,
      });

      // Save to the database
      await newCustomer.save();

      res.status(200).json({ message: 'Customer added successfully', customer: newCustomer });
  } catch (error) {
      console.error('Error adding customer:', error.message);
      res.status(500).json({ message: 'Error adding customer', error: error.message });
  }
});

//List Route
router.get("/list", authorization, async (req, res) => {
  try {
    // Use the `email` or `workspace` extracted by the `verifyToken` middleware
    //const {  workspace } = req;
    
  //   if (!email) {
  //     return res.status(400).json({ success: false, message: "Invalid token or no email provided" });
  //   }

    // Query the database to find customers associated with the email or workspace
    const customers = await Customer.find({ workspace:req.workspace }); // Update fields as per your schema

  //   if (!customers || customers.length === 0) {
  //     return res.status(404).json({ success: false, message: "No data found for the given token" });
  //   }

    // Respond with the filtered customer data
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update a customer by token
router.post('/update', authorization, async (req, res) => {
  const { id,name, email, contact_number, display_name, dob } = req.body;

  try {
      // Find and update the customer using email and workspace from the token
      const updatedCustomer = await Customer.findOneAndUpdate(
          { workspace: req.workspace,_id:id }, // Match email and workspace from token
          { $set:{name, email,contact_number, display_name, dob }}, // Update these fields
          { new: true } // Return the updated document
      );

      // if (!updatedCustomer) {
      //     return res.status(404).json({ message: 'Customer not found or not in this workspace' });
      // }

      res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
  } catch (error) {
      console.error('Error updating customer:', error.message);
      res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Delete a customer by ID
router.post('/delete',authorization, async (req, res) => {
  const { id } = req.body;
  
  const workspace = req.workspace;
  console.log(req.body);
  try {
      
      console.log(req.body)
      const deletedCustomer = await Customer.deleteOne({workspace,_id:id},{new:true});

      if (!deletedCustomer) {
          return res.status(404).json({ error: 'Customer not found' });
      }

      res.status(200).json({ success: true, message: 'Customer deleted successfully', data: deletedCustomer });
  } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ error: 'An error occurred while deleting the customer' });
  }
});

module.exports = router;





































