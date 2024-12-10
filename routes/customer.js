// Import required modules
const express = require('express'); // Express framework for routing and middleware
const Customer = require('../models/Customer'); // Customer model for database operations
const authorization = require('../functions/auth'); // Authorization middleware for protected routes
const zlib = require('zlib'); // Zlib library for compression and decompression

require('dotenv').config(); // Load environment variables from the .env file

// Initialize an Express router instance
const router = express.Router();

//add customer
router.post('/add', authorization, async (req, res) => {
    // Destructure the required fields from the request body
    const { name, email, display_name, contact_number, dob, password } = req.body;
  
    try {
        // Check if a customer with the given email already exists in the database
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            // If a customer with the email exists, return a 400 Bad Request response
            return res.status(400).json({ message: 'Email already exists' });
        }
  
        // Create a new customer instance with the provided data
        const newCustomer = new Customer({
            workspace: req.workspace, // The workspace is extracted from the verified token
            name,                    // Assign the customer's name
            email,                   // Assign the customer's email
            display_name,            // Assign the display name
            contact_number,          // Assign the contact number
            dob,                     // Assign the date of birth
            password                 // Assign the password
        });
  
        // Save the newly created customer instance to the database
        await newCustomer.save();
  
        // Send a success response with a message and the newly created customer
        res.status(200).json({ message: 'Customer added successfully', customer: newCustomer });
    } catch (error) {
        // Log the error to the console for debugging purposes
        console.error('Error adding customer:', error.message);
  
        // Return a 500 Internal Server Error response with the error message
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
  });
  
// List Customer
router.get("/list", authorization, async (req, res) => {
    try {
      // Query the database to find all customers associated with the workspace from the token
      const customers = await Customer.find({ workspace: req.workspace });
  
      // Send a success response with the retrieved customer data
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      // Log the error to the console for debugging purposes
      console.error("Error fetching customers:", error);
  
      // Send an error response with a 500 Internal Server Error status
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
  
// Update customer 
router.post('/update', authorization, async (req, res) => {
    // Destructure the necessary fields from the request body
    const { id, name, email, contact_number, display_name, dob } = req.body;
  
    try {
        // Find a customer by workspace and ID, then update the fields (name, email, etc.)
        const updatedCustomer = await Customer.findOneAndUpdate(
            { workspace: req.workspace, _id: id }, // Match customer by workspace and ID from the token
            { $set: { name, email, contact_number, display_name, dob }}, // Set the new values for the customer fields
            { new: true } // Return the updated customer document
        );
  
        // Send a success response with the updated customer data
        res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
    } catch (error) {
        // Log the error message to the console for debugging
        console.error('Error updating customer:', error.message);
  
        // Send an error response with a 500 Internal Server Error status and error message
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
  });
  

// Delete a customer by ID
router.post('/delete', authorization, async (req, res) => {
    // Destructure the 'id' field from the request body
    const { id } = req.body;
  
    // Extract the workspace from the authorization token (user context)
    const workspace = req.workspace;
    console.log(req.body); // Log the request body for debugging purposes
  
    try {
        // Log the request body again (duplicate log, can be removed for production)
        console.log(req.body);
        
        // Attempt to delete a customer by matching the 'workspace' and '_id' of the customer
        const deletedCustomer = await Customer.deleteOne({ workspace, _id: id }, { new: true });
  
        // If no customer was found and deleted, return a 404 error response
        if (!deletedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
  
        // If the deletion was successful, send a success response with the deleted customer data
        res.status(200).json({ success: true, message: 'Customer deleted successfully', data: deletedCustomer });
    } catch (error) {
        // Log the error to the console for debugging
        console.error('Error deleting customer:', error);
  
        // Send a 500 Internal Server Error response with the error message
        res.status(500).json({ error: 'An error occurred while deleting the customer' });
    }
  });
  
// Delete multiple customers by encrypted IDs
router.post('/deletes', authorization, async (req, res) => {
    const { encryptedIds } = req.body;
    const workspace = req.workspace;

    console.log("encryptedIds:", encryptedIds);

    try {
        // Validate input
        if (!encryptedIds) {
            return res.status(400).json({ error: 'Please provide encrypted customer IDs' });
        }

        // Decode the base64 string to a buffer
        const decodedBuffer = Buffer.from(encryptedIds, 'base64');
        console.log("#################################################################");
        console.log("decodedBuffer-------=======>", decodedBuffer);
        console.log("##########################################################################");

        // Decompress the buffer
        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Convert decompressed buffer to string
        const decodedString = decompressedBuffer.toString('utf-8');
        console.log("decodedString", decodedString);

        // Parse JSON string to get decrypted data
        const decryptedData = JSON.parse(decodedString);
        console.log("decryptedData", decryptedData);

        // Extract customer IDs
        const ids = decryptedData.ids;
        console.log("ids", ids);

        // Validate the IDs
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Decrypted data does not contain valid customer IDs' });
        }

        // MongoDB query to delete customers
        const deleteResult = await Customer.deleteMany({
            _id: { $in: ids },
            workspace: req.workspace,
        });

        console.log("Delete Result:", deleteResult);

        // Handle case where no records were deleted
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: 'No customers found to delete' });
        }

        res.status(200).json({
            success: true,
            message: `${deleteResult.deletedCount} customer(s) deleted successfully.`,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Error deleting customers', error: error.message });
    }
});



module.exports = router;
