const express = require('express');
const router = express.Router();
const authorization = require('../functions/auth')
const LabelController = require('../controllers/labelController');
const label = new LabelController()

router.post('/add',authorization, async (req, res) => {
    const { labels } = req.body;  // Extract labels from the request body
    console.log("label",req.body);

    const workspace = req.workspace;  // Assuming the workspace is attached to the req object
    console.log("workspae",workspace);
    
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

router.get('/list',authorization, async (req, res) => {

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

router.post('/delete',authorization, async (req, res) => {
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

router.post('/assign', authorization, async (req, res) => {
    const { labels, customerIds } = req.body; // Extract `labels` and `customerIds`
    const workspace = req.workspace; // Extract `workspace` from the request object
    console.log("Labels:", labels, "CustomerIds:", customerIds, "Workspace:", workspace);

    try {
        // Pass data to the controller method
        const result = await label.assignLabel({ label: labels, workspace, customerIds });

        // Send the success response to the client
        res.status(200).json(result);
    } catch (error) {
        // Handle and send error response to the client
        console.error("Error in /assign route:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


// const { 
//     addLabel, 
//     listLabels, 
//     deleteLabel, 
//     assignLabel, 
//     encryptCustomerIds, 
//     testOperators 
// } = require('../controllers/labelController');
// const authorization = require('../functions/auth');


// // Define routes and map them to controller functions
// router.post('/add', authorization, addLabel);
// router.get('/list', authorization, listLabels);
// router.post('/delete', authorization, deleteLabel);
// router.post('/assigns', authorization, assignLabel);
// router.post('/encrypt',encryptCustomerIds );
// router.post('/test', authorization, testOperators);

