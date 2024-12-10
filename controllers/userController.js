const Customer = require('../models/Customer');
const Organization = require('../models/Organization');
require('dotenv').config();
const jwt = require('jsonwebtoken');// Import the JSON Web Token library

class userController {

    async registerUser({ Organization_name, name, email, password, contact_number }) {
        try {
            const existingCustomer = await Customer.findOne({ email });
            if (existingCustomer) {
                throw new Error('Email already exists');
            }
    
            const randomTwoDigitNumber = Math.floor(10 + Math.random() * 90);
            const workspaceName = `${Organization_name}${randomTwoDigitNumber}`;
    
            const newCustomer = new Customer({
                workspace: workspaceName,
                name,
                email,
                password, // Store plaintext password (not secure)
                display_name: name,
                contact_number,
            });
            await newCustomer.save();
    
            const newOrganization = new Organization({
                Organization_name,
                workspace: workspaceName,
            });
            await newOrganization.save();
    
            return { message: 'Customer registered successfully' };
        } catch (error) {
            throw new Error(error.message || 'An error occurred during registration');
        }
    }
    
    async loginUser({ workspace, email, password }) {
    try {
        const loginCustomer = await Customer.findOne({ email, password }); // Match plaintext password

        if (!loginCustomer) {
            throw new Error('Invalid credentials');
        }

        const id = loginCustomer._id.toString();
        const token = jwt.sign(
            { id, email: loginCustomer.email, workspace },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );

        return { message: 'Login successful', token };
    } catch (error) {
        throw new Error(error.message || 'An error occurred during login');
    }
    }

   }

module.exports = userController ;  
