const jwt = require('jsonwebtoken'); // Import the JSON Web Token library
const Customer = require('../models/Customer'); // Import the Customer model 
const Organization = require('../models/Organization'); // Import the Organization model
require('dotenv').config(); // Load environment variables from the .env file

// Controller to handle user registration
const register = async (req, res) => {
    const { Organization_name, name, email, password, contact_number } = req.body;

    try {
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const randomTwoDigitNumber = Math.floor(10 + Math.random() * 90);
        const workspaceName = `${Organization_name}${randomTwoDigitNumber}`;

        const newCustomer = new Customer({
            workspace: workspaceName,
            name,
            email,
            password,
            display_name: name,
            contact_number,
        });

        await newCustomer.save();

        const newOrganization = new Organization({
            Organization_name,
            workspace: workspaceName,
        });

        await newOrganization.save();

        res.status(200).json({ message: 'Customer registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering customer', error: error.message });
    }
};

// Controller to handle user login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const loginCustomer = await Customer.findOne({ email, password });
        if (!loginCustomer) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        let id = loginCustomer._id.toString();

        const token = jwt.sign(
            {
                id,
                email: loginCustomer.email,
                workspace: loginCustomer.workspace,
            },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );

        res.setHeader('token', token);
        res.setHeader('id', id);
        res.setHeader('email', loginCustomer.email);
        res.setHeader('workspace', loginCustomer.workspace);
        res.setHeader('Access-Control-Expose-Headers', 'token, id, email, workspace');

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

module.exports = {
    register,
    login,
<<<<<<< HEAD
};
=======
};
>>>>>>> 6796a85c2cb04d9c90ec4c11dd4babdbc4ad4fd1
