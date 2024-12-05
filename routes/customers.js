// // Import required modules
// const express = require('express'); // Express framework for routing and middleware
// const Customer = require('../models/Customer'); // Customer model for database operations
// const authorization = require('../functions/auth'); // Authorization middleware for protected routes
// const zlib = require('zlib'); // Zlib library for compression and decompression
// const { encryptedCustomerIds, decryptedCustomerIds } = require('../functions/utils');

// require('dotenv').config(); // Load environment variables from the .env file

// // Initialize an Express router instance
// const router = express.Router();

// //add customer
// router.post('/add', authorization, async (req, res) => {
//     // Destructure the required fields from the request body
//     const { name, email, display_name, contact_number, dob, password } = req.body;
  
//     try {
//         // Check if a customer with the given email already exists in the database
//         const existingCustomer = await Customer.findOne({ email });
//         if (existingCustomer) {
//             // If a customer with the email exists, return a 400 Bad Request response
//             return res.status(400).json({ message: 'Email already exists' });
//         }
  
//         // Create a new customer instance with the provided data
//         const newCustomer = new Customer({
//             workspace: req.workspace, // The workspace is extracted from the verified token
//             name,                    // Assign the customer's name
//             email,                   // Assign the customer's email
//             display_name,            // Assign the display name
//             contact_number,          // Assign the contact number
//             dob,                     // Assign the date of birth
//             password                 // Assign the password
//         });
  
//         // Save the newly created customer instance to the database
//         await newCustomer.save();
  
//         // Send a success response with a message and the newly created customer
//         res.status(200).json({ message: 'Customer added successfully', customer: newCustomer });
//     } catch (error) {
//         // Log the error to the console for debugging purposes
//         console.error('Error adding customer:', error.message);
  
//         // Return a 500 Internal Server Error response with the error message
//         res.status(500).json({ message: 'Error adding customer', error: error.message });
//     }
//   });
  
// // List Customer
// router.get("/list", authorization, async (req, res) => {
//     try {
//       // Query the database to find all customers associated with the workspace from the token
//       const customers = await Customer.find({ workspace: req.workspace });
  
//       // Send a success response with the retrieved customer data
//       res.status(200).json({ success: true, data: customers });
//     } catch (error) {
//       // Log the error to the console for debugging purposes
//       console.error("Error fetching customers:", error);
  
//       // Send an error response with a 500 Internal Server Error status
//       res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
//   });
  

// // Update customer 
// router.post('/update', authorization, async (req, res) => {
//     // Destructure the necessary fields from the request body
//     const { id, name, email, contact_number, display_name, dob } = req.body;
  
//     try {
//         // Find a customer by workspace and ID, then update the fields (name, email, etc.)
//         const updatedCustomer = await Customer.findOneAndUpdate(
//             { workspace: req.workspace, _id: id }, // Match customer by workspace and ID from the token
//             { $set: { name, email, contact_number, display_name, dob }}, // Set the new values for the customer fields
//             { new: true } // Return the updated customer document
//         );
  
//         // Send a success response with the updated customer data
//         res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
//     } catch (error) {
//         // Log the error message to the console for debugging
//         console.error('Error updating customer:', error.message);
  
//         // Send an error response with a 500 Internal Server Error status and error message
//         res.status(500).json({ message: 'Error updating customer', error: error.message });
//     }
//   });
  

// // Delete a customer by ID
// router.post('/delete', authorization, async (req, res) => {
//     // Destructure the 'id' field from the request body
//     const { id } = req.body;
  
//     // Extract the workspace from the authorization token (user context)
//     const workspace = req.workspace;
//     console.log(req.body); // Log the request body for debugging purposes
  
//     try {
//         // Log the request body again (duplicate log, can be removed for production)
//         console.log(req.body);
        
//         // Attempt to delete a customer by matching the 'workspace' and '_id' of the customer
//         const deletedCustomer = await Customer.deleteOne({ workspace, _id: id }, { new: true });
  
//         // If no customer was found and deleted, return a 404 error response
//         if (!deletedCustomer) {
//             return res.status(404).json({ error: 'Customer not found' });
//         }
  
//         // If the deletion was successful, send a success response with the deleted customer data
//         res.status(200).json({ success: true, message: 'Customer deleted successfully', data: deletedCustomer });
//     } catch (error) {
//         // Log the error to the console for debugging
//         console.error('Error deleting customer:', error);
  
//         // Send a 500 Internal Server Error response with the error message
//         res.status(500).json({ error: 'An error occurred while deleting the customer' });
//     }
//   });
  

// //Encrypt
// // router.post('/encrypt-customer-ids', (req, res) => {//Define a POST route to encrypt customer IDs

// //     //Extract the `customerIds` array from the request body
// //     const { customerIds } = req.body;

// //     try {
// //         //Convert the customer IDs to a JSON string
// //         const jsonString = JSON.stringify(customerIds);

// //         //Compress the JSON string using gzipSync to ensure synchronous compression
// //         const compressedBuffer = zlib.gzipSync(jsonString); // Compress the string using gzip

// //         //Encode the compressed buffer as a base64 string for easy transmission
// //         const base64Encoded = compressedBuffer.toString('base64');

// //         res.status(200).json({ encryptedData: base64Encoded });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Encryption failed', error: error.message });
// //     }
// // });

// // Route to encrypt customer IDs
// router.post('/encrypt-customer-ids', (req, res) => {
//     const { customerIds } = req.body;

//     try {
//         const encryptedData = encryptedCustomerIds(customerIds);
//         res.status(200).json({ encryptedData });
//     } catch (error) {
//         res.status(500).json({ message: 'Encryption failed', error: error.message });
//     }
// });

// // Delete multiple customers by encrypted IDs
// // router.post('/deletes', authorization, async (req, res) => {
// //     // Extract the encrypted customer IDs (base64 string) from the request body
// //     const { encryptedIds } = req.body; 
// //     // Extract the workspace from the authorized token (user context)
// //     const workspace = req.workspace;

// //     try {
// //         // Validate the input to ensure encryptedIds are provided
// //         if (!encryptedIds) {
// //             // If no encrypted IDs are provided, return a 400 Bad Request error
// //             return res.status(400).json({ error: 'Please provide encrypted customer IDs' });
// //         }

// //         // Decode the Base64 encoded encrypted customer IDs
// //         const decodedBuffer = Buffer.from(encryptedIds, 'base64');
        
// //         // Decompress the decoded buffer (Assume it is gzip compressed)
// //         const decompressedBuffer = await new Promise((resolve, reject) => {
// //             zlib.gunzip(decodedBuffer, (err, result) => {
// //                 if (err) reject(err); // Reject if there is an error during decompression
// //                 else resolve(result); // Resolve with the decompressed result
// //             });
// //         });

// //         // Convert the decompressed buffer into a string (UTF-8 format)
// //         const decryptedString = decompressedBuffer.toString('utf-8');

// //         // Parse the JSON string to get the list of customer IDs
// //         const ids = JSON.parse(decryptedString);

// //         // Log the decrypted IDs for debugging purposes
// //         console.log('Decrypted IDs:', ids);

// //         // Validate the decrypted IDs to ensure it's an array and contains elements
// //         if (!Array.isArray(ids) || ids.length === 0) {
// //             // If the decrypted data is invalid, return a 400 Bad Request error
// //             return res.status(400).json({ error: 'Decrypted data does not contain valid customer IDs' });
// //         }

// //         // Attempt to delete customers from the database matching the decrypted IDs and workspace
// //         const result = await Customer.deleteMany({
// //             workspace, // Filter by workspace
// //             _id: { $in: ids }, // Match the customer IDs against the decrypted list
// //         });

// //         // Check if any customers were deleted
// //         if (result.deletedCount === 0) {
// //             // If no customers were deleted, return a 404 Not Found error
// //             return res.status(404).json({ error: 'No customers found to delete' });
// //         }

// //         // Send a success response indicating how many customers were deleted
// //         res.status(200).json({
// //             success: true,
// //             message: `${result.deletedCount} customer(s) deleted successfully`,
// //         });
// //     } catch (error) {
// //         // Log the error for debugging purposes if anything fails during decryption or deletion
// //         console.error('Error decrypting or deleting customers:', error);

// //         // Return a 500 Internal Server Error response with a generic error message
// //         res.status(500).json({ error: 'An error occurred while processing the request' });
// //     }
// // });

// // Route to delete multiple customers by encrypted IDs
// router.post('/deletes', authorization, async (req, res) => {
//     const { encryptedCustomerIds } = req.body;
//     const workspace = req.workspace;

//     try {
//         // Validate that encrypted IDs are provided
//         if (!encryptedCustomerIds) {
//             return res.status(400).json({ error: 'Please provide encrypted customer IDs' });
//         }

//         // Decrypt the encrypted customer IDs
//         const ids = await decryptedCustomerIds(encryptedCustomerIds);

//         if (!Array.isArray(ids) || ids.length === 0) {
//             return res.status(400).json({ error: 'Decrypted data does not contain valid customer IDs' });
//         }

//         // Attempt to delete customers from the database
//         const result = await Customer.deleteMany({
//             workspace, // Filter by workspace
//             _id: { $in: ids }, // Match IDs in the list
//         });

//         if (result.deletedCount === 0) {
//             return res.status(404).json({ error: 'No customers found to delete' });
//         }

//         res.status(200).json({
//             success: true,
//             message: `${result.deletedCount} customer(s) deleted successfully`,
//         });
//     } catch (error) {
//         console.error('Error decrypting or deleting customers:', error);
//         res.status(500).json({ error: 'An error occurred while processing the request' });
//     }
// });


// module.exports = router;



// routes/customers.js
const express = require('express');
const router = express.Router();
const authorization = require('../functions/auth');
const customerController = require('../controllers/customerController');

// Route to add a new customer
router.post('/add', authorization, customerController.addCustomer);

// Route to list all customers
router.get('/list', authorization, customerController.listCustomers);

// Route to update a customer
router.post('/update', authorization, customerController.updateCustomer);

// Route to delete a single customer by ID
router.post('/delete', authorization, customerController.deleteCustomer);

// Route to encrypt customer IDs
router.post('/encrypt-customer-ids', customerController.encryptCustomerIdsHandler);

// Route to delete multiple customers by encrypted IDs
router.post('/deletes', authorization, customerController.deleteMultipleCustomers);

module.exports = router;
