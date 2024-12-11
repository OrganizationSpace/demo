const express = require('express');//Import the Express framework
const authorization = require('../functions/auth')//Import a custom authorization function for token handling
const LabelController = require('../controllers/labelController');// Import the labelController class to handle logic.
const label = new LabelController()// Create an instance of the labelController class to call its methods.

//Create an Express router instance to define and manage routes for the application
const router = express.Router();

//Route: Label add
router.post('/add',authorization, async (req, res) => // Define a POST route for '/add'
    {
    const { labels } = req.body;  // Extract labels from the request body
    console.log("label",req.body);

    const workspace = req.workspace;  // Assuming the workspace is attached to the req object
    console.log("workspace",workspace);
    
    try {
        // Pass the extracted data (labels and workspace) to the controller method
        const updatedOrganization = await label.addLabel({labels, workspace});
        console.log("update:",updatedOrganization);
        
        // Respond with the updated organization
        res.status(200).json(updatedOrganization);
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: error.message });
    }
});

//Route: Label list
router.get('/list',authorization, async (req, res) => // Define a GET route for '/list'
    {
    const workspace = req.workspace;  // Assuming the workspace is attached to the req object
    console.log("workspae",workspace);
    
    try {
        // Pass the extracted data (labels and workspace) to the controller method
        const labelList = await label.listLabel({workspace});
        console.log("update:",labelList);
        
        // Respond with the updated organization
        res.status(200).json(labelList);
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: error.message });
    }
});

//Route: Label delete
router.post('/delete',authorization, async (req, res) => // Define a POST route for '/delete'
    {
    const { labels } = req.body;  // Extract labels from the request body
    console.log("label",req.body);

    const workspace = req.workspace;  // Assuming the workspace is attached to the req object
    console.log("workspae",workspace);
    
    try {
        // Pass the extracted data (labels and workspace) to the controller method
        const deleteLabels = await label.deleteLabel({labels, workspace});
        console.log("update:",deleteLabels);
        
        // Respond with the updated organization
        res.status(200).json(deleteLabels);
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: error.message });
    }
});

//Route: Label assign
router.post('/assign', authorization, async (req, res) => // Define a POST route for '/assign'
    {
    const { labels, customerIds } = req.body; // Extract `labels` and `customerIds`
    const workspace = req.workspace; // Extract `workspace` from the request object
    console.log("Labels:", labels, "CustomerIds:", customerIds, "Workspace:", workspace);

    try {
        // Pass data to the controller method
        const result = await label.assignLabel({ labels: labels, workspace, customerIds });

        // Send the success response to the client
        res.status(200).json(result);
    } catch (error) {
        // Handle and send error response to the client
        console.error("Error in /assign route:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Export the router to make the routes available for use in other parts of the application.
module.exports = router;