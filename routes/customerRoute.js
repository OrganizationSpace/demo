const express = require('express');
const router = express.Router();
const authorization = require('../functions/auth');
const customerController = require('../controllers/customerContoller');

// Route to add a new customer
router.post('/add', authorization, customerController.addCustomer);

// Route to list all customers
router.get('/list', authorization, customerController.listCustomers);

// Route to update a customer
router.post('/update', authorization, customerController.updateCustomer);

// Route to delete a single customer by ID
router.post('/delete', authorization, customerController.deleteCustomer);

// Route to delete multiple customers by encrypted IDs
router.post('/deletes', authorization, customerController.deleteMultipleCustomers);

module.exports = router;
