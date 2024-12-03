// routes/auth.js
const express = require('express');
const Customer = require('../models/Customer');
const authorization = require('../functions/auth');
const zlib =require('zlib');

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
    const customers = await Customer.find({ workspace:req.workspace }); // Update fields as per your schema
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


router.post('/encrypt-customer-ids', (req, res) => {
  const { customerIds } = req.body;


  try {
      const jsonString = JSON.stringify(customerIds);
      const compressedBuffer = zlib.gzipSync(jsonString); // Ensure gzipSync is used
      const base64Encoded = compressedBuffer.toString('base64');
      res.status(200).json({ encryptedData: base64Encoded });
  } catch (error) {
      res.status(500).json({ message: 'Encryption failed', error: error.message });
  }
});


// Delete multiple customers by encrypted IDs
router.post('/deletes', authorization, async (req, res) => {
    const { encryptedIds } = req.body; // Encrypted and compressed customer IDs (base64 string)
    const workspace = req.workspace;

    try {
        // Validate the input
        if (!encryptedIds) {
            return res.status(400).json({ error: 'Please provide encrypted customer IDs' });
        }

        // Decode from Base64
        const decodedBuffer = Buffer.from(encryptedIds, 'base64');
        
        // Decompress the buffer (assume gzip compression)
        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Convert the decompressed data into a string
        const decryptedString = decompressedBuffer.toString('utf-8');

        // Parse the JSON string to get the list of IDs
        const ids = JSON.parse(decryptedString);

        console.log('Decrypted IDs:', ids);

        // Validate the decrypted IDs
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Decrypted data does not contain valid customer IDs' });
        }

        // Delete customers matching the IDs and workspace
        const result = await Customer.deleteMany({
            workspace,
            _id: { $in: ids },
        });

        // Check if any customers were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No customers found to delete' });
        }

        // Send success response
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} customer(s) deleted successfully`,
        });
    } catch (error) {
        console.error('Error decrypting or deleting customers:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});


module.exports = router;





































