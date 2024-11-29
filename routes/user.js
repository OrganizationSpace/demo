// routes/auth.js
////////
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

//Route: Update user details
router.post('/Update',authorization, async (req, res) => {
  const {  contact_number } = req.body;
console.log(req.body);
//console.log(req.name);

  try {
    // Find the user by email as send as a token
    const UpdateUser = await Customer.findOneAndUpdate({ email:req.email },{$set:{contact_number:contact_number}});
  console.log(UpdateUser);
  
    res.status(200).json({ message: 'Updated', UpdateUser });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
});


module.exports = router;





































// const {encrypt} = require('../functions/encryption');



// // Route: Register a New User
// router.post('/register', async (req, res) => {
//   const { name, email, password, display_name, contact_number, dob } = req.body;

//   try {
//       // Check if email already exists
//       const existingCustomer = await Customer.findOne({ email });
//       if (existingCustomer) {
//           return res.status(400).json({ message: 'Email already exists' });
//       }

//       // Create a new customer (MongoDB auto-generates the _id)
//       const customerData = {
//           name,
//           email,
//           password, 
//           display_name,
//           contact_number,
//           dob,
//       };

//       const newCustomer = new Customer(customerData);

//       // Save the customer to generate the _id
//       await newCustomer.save();

//       // Encrypt the _id and store it in a new field
//       const encryptedId = encrypt(newCustomer._id.toString());
//       newCustomer.encryptedId = encryptedId;
//       await newCustomer.save();

//       res.status(200).json({ 
//           message: 'Customer registered successfully', 
//           id: encryptedId 
//       });
//   } catch (error) {
//       res.status(500).json({ message: 'Error registering customer', error: error.message });
//   }
// });





// const express = require('express');
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const Customer = require('../models/Customer');
// const verifyToken = require('../functions/auth');
// const { encrypt } = require('../functions/encrypt'); // Import the encrypt function
// require('dotenv').config();

// const router = express.Router();

// // Route: Register a New User
// router.post('/register', async (req, res) => {
//     const { name, email, password, display_name, contact_number, dob } = req.body;
  
//     try {
//         // Check if a customer with the given email already exists
//         const existingCustomer = await Customer.findOne({ email });
//         if (existingCustomer) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         // Generate a new ObjectId for the customer
//         const newCustomerId = new mongoose.Types.ObjectId();
//         const encryptedId = encrypt(newCustomerId.toString()).content;  // Encrypt the _id

//         // Create a new customer and save to database
//         const newCustomer = new Customer({
//             _id: newCustomerId,
//             encryptedId, // Save the encrypted version of the ID
//             name,
//             email,
//             password,
//             display_name,
//             contact_number,
//             dob
//         });

//         await newCustomer.save();
  
//         res.status(200).json({ message: 'Customer registered successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error registering customer', error: error.message });
//     }
// });

// // Route: Login and Generate Token
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find the customer by email
//         const customer = await Customer.findOne({ email });
//         if (!customer) return res.status(404).json({ message: 'Email not found' });

//         // Check if the password matches directly
//         if (customer.password !== password) return res.status(400).json({ message: 'Invalid credentials' });

//         // Generate JWT token
//         const token = jwt.sign({
//             id: customer._id.toString(),
//             email: customer.email
//         }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Set the data as a response header 
//         res.setHeader('token', token);
//         res.setHeader('id', customer._id.toString());
//         res.setHeader('email', customer.email);

//         res.setHeader('Access-Control-Expose-Headers', 'token, id, email');

//         res.status(200).json({ message: 'Login successful' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error during login', error: error.message });
//     }
// });

// // Route: Update Contact Number (Authenticated)
// router.post('/Update', verifyToken, async (req, res) => {
//     const { contact_number } = req.body;
  
//     try {
//         // Find the user by email (email comes from the token) and update the contact_number
//         const updateUser = await Customer.findOneAndUpdate(
//             { email: req.email }, 
//             { $set: { contact_number } }, 
//             { new: true }
//         );

//         res.status(200).json({ message: 'Updated', updateUser });
//     } catch (error) {
//         res.status(500).json({ message: 'Error during update', error: error.message });
//     }
// });

// module.exports = router;