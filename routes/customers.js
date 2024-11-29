// routes/auth.js
const express = require('express');
const Customer = require('../models/Customer');
const authorization = require('../functions/auth');

require('dotenv').config();

const router = express.Router();

//add customer
router.post('/add', authorization, async (req, res) => {
  const { name, email, display_name ,contact_number, dob , password } = req.body;

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
          password
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





































