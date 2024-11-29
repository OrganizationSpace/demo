const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    workspace:{
        type:String
    },
    name: {
        type: String,
        trim: true,
    },
    password: {
        type: String,required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        // match: [/.+@.+\..+/, 'Please enter a valid email address'], // Email validation
    },
    display_name: {
        type: String,
        trim: true,
    },
    contact_number: {
        type: String, 
        required: true,
        // match: [/^\d{10}$/, 'Contact number must be exactly 10 digits.']
    },
    dob: {
        type: String, 
    },
    labels: [{
        type: String,
    }],
});

module.exports = mongoose.model('Customer', CustomerSchema);
