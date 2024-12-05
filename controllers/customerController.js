// controllers/customerController.js

const Customer = require('../models/Customer');
const { encryptCustomerIds, decryptCustomerIds } = require('../functions/utils');

/**
 * Adds a new customer.
 */
const addCustomer = async (req, res) => {
    const { name, email, display_name, contact_number, dob, password } = req.body;

    try {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newCustomer = new Customer({
            workspace: req.workspace,
            name,
            email,
            display_name,
            contact_number,
            dob,
            password, // Remember to hash passwords
        });

        await newCustomer.save();

        res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
    } catch (error) {
        console.error('Error adding customer:', error.message);
        res.status(500).json({ message: 'Error adding customer', error: error.message });
    }
};

/**
 * Lists all customers in the workspace.
 */
const listCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ workspace: req.workspace });
        res.status(200).json({ success: true, data: customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * Updates an existing customer.
 */
const updateCustomer = async (req, res) => {
    const { id, name, email, contact_number, display_name, dob } = req.body;

    try {
        const updatedCustomer = await Customer.findOneAndUpdate(
            { workspace: req.workspace, _id: id },
            { $set: { name, email, contact_number, display_name, dob } },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
    } catch (error) {
        console.error('Error updating customer:', error.message);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

/**
 * Deletes a single customer by ID.
 */
const deleteCustomer = async (req, res) => {
    const { id } = req.body;
    const workspace = req.workspace;
    console.log('Delete Request Body:', req.body);

    try {
        const deletedCustomer = await Customer.findOneAndDelete({ workspace, _id: id });

        if (!deletedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json({ success: true, message: 'Customer deleted successfully', data: deletedCustomer });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'An error occurred while deleting the customer' });
    }
};

/**
 * Encrypts customer IDs.
 */
const encryptCustomerIdsHandler = (req, res) => {
    const { customerIds } = req.body;

    try {
        const encryptedData = encryptCustomerIds(customerIds);
        res.status(200).json({ encryptedData });
    } catch (error) {
        console.error('Encryption failed:', error.message);
        res.status(500).json({ message: 'Encryption failed', error: error.message });
    }
};

/**
 * Deletes multiple customers by encrypted IDs.
 */
const deleteMultipleCustomers = async (req, res) => {
    const { encryptedCustomerIds } = req.body;
    const workspace = req.workspace;

    try {
        if (!encryptedCustomerIds) {
            return res.status(400).json({ error: 'Please provide encrypted customer IDs' });
        }

        const ids = await decryptCustomerIds(encryptedCustomerIds);

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Decrypted data does not contain valid customer IDs' });
        }

        const result = await Customer.deleteMany({
            workspace,
            _id: { $in: ids },
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No customers found to delete' });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} customer(s) deleted successfully`,
        });
    } catch (error) {
        console.error('Error decrypting or deleting customers:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};

module.exports = {
    addCustomer,
    listCustomers,
    updateCustomer,
    deleteCustomer,
    encryptCustomerIdsHandler,
    deleteMultipleCustomers,
};
