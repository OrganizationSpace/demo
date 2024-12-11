const express = require('express');
const router = express.Router();
const authorization = require('../functions/auth');
const Customer = require('../models/Customer'); // Import the Customer model
const CustomerController = require('../controllers/customerController');
const customerController = new CustomerController(); // Instantiate the CustomerController
const zlib = require('zlib');

// Route to add a new customer
router.post('/add', authorization, async (req, res) => {
    // Destructure the required fields from the request body
    const { name, email, display_name, contact_number, dob, password } = req.body;

    try {
        // Prepare the customer data
        const customerData = {
            workspace: req.workspace, // The workspace is extracted from the verified token
            name,
            email,
            display_name,
            contact_number,
            dob,
            password
        };

        // Pass the customer data to the controller for saving (checking if customer exists, etc.)
        await customerController.addCustomer(customerData, res);
    } catch (error) {
        // Log the error to the console for debugging purposes
        console.error('Error adding customer:', error.message);

        // Return a 500 Internal Server Error response with the error message
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
});

// Route to list the customer
router.get("/list", authorization, async (req, res) => {
    try {
        // Pass the workspace from the request to the controller method to get all customers
        await customerController.listCustomers(req.workspace, res);
    } catch (error) {
        // Log the error for debugging
        console.error("Error fetching customers:", error);
        
        // Send an error response
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route to Update customer
router.post('/update', authorization, async (req, res) => {
    const { id, name, email, contact_number, display_name, dob } = req.body;
    const workspace = req.workspace;  // Workspace extracted from the token

    try {
        // Pass the data to the controller method for updating the customer
        await customerController.updateCustomer(id, { name, email, contact_number, display_name, dob, workspace }, res);
    } catch (error) {
        // Log the error for debugging
        console.error("Error updating customer:", error.message);

        // Send error response with a 500 Internal Server Error status
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
});

// Delete a customer by ID
router.post('/delete', authorization, async (req, res) => {
    const { id } = req.body;  // Destructure the 'id' field from the request body
    const workspace = req.workspace;  // Extract workspace from the authorization token

    try {
        // Pass the customer ID and workspace to the controller for deletion
        await customerController.deleteCustomer(id, workspace, res);
    } catch (error) {
        // Handle any errors that occur during the deletion process
        console.error("Error deleting customer:", error.message);
        res.status(500).json({ error: 'An error occurred while deleting the customer' });
    }
});




module.exports = router;