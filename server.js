//Import necessary dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

//Import route files
const authRoutes = require('./routes/customerRoute');
const userRoutes = require('./routes/userRoute');
const labelRoutes = require('./routes/labelRoute')

//Create an Express app instance
const app = express();

//Middleware to parse incoming requests
app.use(bodyParser.json());  // Middleware to parse JSON bodies
app.use(morgan('dev')); // Middleware to log HTTP requests (using 'dev' format)
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(express.json());  // Middleware to parse JSON bodies

//Middleware to handle Cross-Origin Resource Sharing (CORS)
app.use(cors()); // Allow all origins by default

//Set up the routes
app.use('/customers', authRoutes); // Route for customer-related operations
app.use('/users', userRoutes); // Route for user-related operations
app.use('/labels',labelRoutes);// Route for label-related operations


//MongoDB connection setup using mongoose
mongoose.connect(process.env.MONGO_URI, {
    //useNewUrlParser: true, // Use new URL parser to avoid deprecation warnings
    //useUnifiedTopology: true, // Use the new topology engine to handle MongoDB connection
})
    .then(() => console.log('MongoDB connected')) // Log success message when connected
    .catch(err => console.error('MongoDB connection error:', err)); // Catch any connection errors

//A basic route to check server status
app.get('/', async (req, res) => {
    try {
        console.log("welcome"); // Log a welcome message to the console
        res.status(200).json({ message: "welcome" }); // Send a welcome response to the client
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating labels' }); // Handle any errors that occur
    }
});

//Start the server and listen on the specified port
const PORT = process.env.PORT || 5000; // Default to port 5000 if no port is specified
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // Log the server's running address
