const zlib = require('zlib');

const Customer = require('../models/Customer');
const Organization = require('../models/Organization');

class CustomerController {
        // Add a new customer
        async addCustomer(customerData, res) {
            try {
                // Check if a customer with the given email already exists in the database
                const existingCustomer = await Customer.findOne({ email: customerData.email });
                if (existingCustomer) {
                    // If a customer with the email exists, return a 400 Bad Request response
                    return res.status(400).json({ message: 'Email already exists' });
                }
    
                // Create a new customer instance using the provided customer data
                const newCustomer = new Customer(customerData);
    
                // Save the newly created customer to the database
                await newCustomer.save();
    
                // Send a success response with a message and the newly created customer data
                res.status(200).json({ message: 'Customer added successfully', customer: newCustomer });
            } catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }

        //list customer
        async listCustomers(workspace, res) {
            try {
                // Query to find all customers associated with the workspace
                const customers = await Customer.find({ workspace });
    
                // Send the success response with the retrieved customer data
                res.status(200).json({ success: true, data: customers });
            } catch (error) {
                // Handle errors if the query fails
                console.error("Error fetching customers:", error);
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        }

        //update customer
        async updateCustomer(id, customerData, res) {
            try {
                // Find and update the customer based on the ID and workspace
                const updatedCustomer = await Customer.findOneAndUpdate(
                    { workspace: customerData.workspace, _id: id }, // Match customer by workspace and ID
                    { $set: customerData }, // Set the new values for the customer fields
                    { new: true } // Return the updated customer document
                );
    
                // If no customer is found, return a 404 response
                if (!updatedCustomer) {
                    return res.status(400).json({ message: 'Customer not found' });
                }
    
                // Send a success response with the updated customer data
                res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
            } catch (error) {
                // Log error and send a failure response
                console.error("Error updating customer:", error.message);
                res.status(500).json({ message: 'Error updating customer', error: error.message });
            }
        }

        // delete customer
        async deleteCustomer(id, workspace, res) {
                try {
                    // Delete the customer by matching both the workspace and the ID
                    const deletedCustomer = await Customer.deleteOne({ workspace, _id: id });
        
                    // If no customer was found and deleted, return a 404 response
                    if (deletedCustomer.deletedCount === 0) {
                        return res.status(400).json({ error: 'Customer not found' });
                    }
        
                    // Send a success response with a message confirming the deletion
                    res.status(200).json({
                        success: true,
                        message: 'Customer deleted successfully',
                        data: deletedCustomer
                    });
                } catch (error) {
                    // Log and handle any errors
                    console.error("Error deleting customer:", error.message);
                    res.status(500).json({ error: 'An error occurred while deleting the customer' });
                }
            }
        };
    
        module.exports = CustomerController;