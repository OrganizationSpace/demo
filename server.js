const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/customers');
const listRoutes = require('./routes/label');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))

// Allow all origins by default
app.use(cors());

//routes
app.use('/customer', authRoutes); 
app.use('/label', listRoutes); 


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

//display route
app.get('/', async (req, res) => {
           try {
            console.log("welcome");
            res.status(200).json({message:"welcome"});
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while updating labels' });
        }
    });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));

