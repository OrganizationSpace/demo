const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const user = new userController()

router.post('/register', async (req, res) => {
    const { Organization_name, name, email, password, contact_number } = req.body;

    try {
        const response = await user.registerUser({ Organization_name, name, email, password, contact_number });
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const response = await user.loginUser({  email, password });
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
