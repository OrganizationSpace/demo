const express = require('express');//Import the Express framework 
const authorization = require('../functions/auth');//Import a custom authorization function for token handling 
const Customer = require('../models/Customer');//Import the Customer model to interact with the Customer database collection
const Organization = require('../models/Organization');//Import the Organization model to interact with the Organization database collection

const zlib = require('zlib');
const router = express.Router();//Create an Express router instance to define and manage routes for the application

//Add a labels 
router.post('/add', authorization, async (req, res) => {//Define a POST route to add labels, using the `authorization` middleware for authentication

    const { labels } = req.body;    //Destructure the `labels` array from the request body

    try {
        console.log(req.body);
        console.log("Workspace:", req.workspace);

        //Use `findOneAndUpdate` to find the organization by the user's workspace and update it
        const addLabel = await Organization.findOneAndUpdate(
            { workspace: req.workspace }, // Filter: Match by the workspace
            { $addToSet: { labels: labels } }, // Update: Add new labels, avoiding duplicates
            { new: true } // Option: Return the updated document
        );

        console.log("list", addLabel);

        //Respond with a 200 status and the updated organization data
        res.status(200).json(addLabel);
    } catch (error) {
        //Handle errors and respond with a 500 status and an error message
        res.status(500).json({ error: 'An error occurred while updating labels' });
    }
});

//List the labels 
router.get('/list', authorization, async (req, res) => {//Define a GET route to fetch a list of labels, using `authorization` middleware for authentication

    try {
        //Query the database to find the organization by the user's workspace
        const labelList = await Organization.findOne(
            { workspace: req.workspace }, // Filter: Match by the workspace extracted from the token
            { labels: 1, _id: 0 } // Projection: Include only the `labels` field, exclude the `_id` field
        );

        res.status(200).json(labelList);
    } catch (error) {
        console.error('Error fetching labels:', error);

        res.status(500).json({ error: 'An error occurred while fetching labels' });
    }
});

//Delete the labels 
router.post('/delete', authorization, async (req, res) => {//Define a POST route to delete labels, using `authorization` middleware for authentication

    //Extract the `labels` array from the request body
    const { labels } = req.body;

    console.log(req.body);
    console.log(req.workspace);

    try {
        //Use `updateOne` to find the organization by the workspace and remove labels
        const deleteLabel = await Organization.updateOne(
            { workspace: req.workspace }, // Filter: Match by the workspace
            { $pull: { labels: labels } }, // Update: Remove all labels that match any in the array
            { new: true } // Option: Ensure the response contains the updated document
        );

        console.log(deleteLabel);

        res.status(200).json({ message: 'Labels deleted from documents', deleteLabel });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the labels' });
    }
});

//assign the labels
router.post('/assign', authorization, async (req, res) => {
    const { label,customerIds } = req.body;

    console.log(req.body);

    try {
        // Decode the base64 string to a buffer
        const encodedString = customerIds;
        const decodedBuffer = Buffer.from(encodedString, 'base64');

        console.log("#################################################################");
        console.log("encodedString-------=======>", decodedBuffer);
        console.log("##########################################################################");

        // Decompress the buffer
        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        // Convert decompressed buffer to string
        const decodedString = decompressedBuffer.toString('utf-8');
        console.log("decodedString", decodedString);

        // Parse JSON string to get decrypted data
        req.decryptedData = JSON.parse(decodedString);
        console.log("decryptedData", req.decryptedData);

        // Extract customer IDs directly
        const id = req.decryptedData.ids; // Fix: decryptedData is already an array
        console.log("ids", id);

        // MongoDB query to assign labels
        const updateResult = await Customer.updateMany(
            { _id: { $in: id }, workspace: req.workspace }, // Match customers by ID and workspace
            { $set: { labels: label } } // Add label without duplicates
        );
        console.log("Update:", updateResult);

        res.status(200).json({
            message: 'Label assigned successfully to customers.',
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: 'Error assigning label to customers', error: error.message });
    }
});

//Encrypt
router.post('/encrypt', (req, res) => {
    // 2
    const { customerIds } = req.body;


    try {
        // 3
        const jsonString = JSON.stringify(customerIds);


        // 4
        const compressedBuffer = zlib.gzipSync(jsonString); // Compress the string using gzip


        // 5
        const base64Encoded = compressedBuffer.toString('base64');


        res.status(200).json({ encryptedData: base64Encoded });
    } catch (error) {
        res.status(500).json({ message: 'Encryption failed', error: error.message });
    }
});

//Testing operator
router.post('/test', authorization, async (req, res) => {
    const { labelsToRemove, labelToAdd, labelsToReplace, labelToPush } = req.body;

    try {
        //First, remove the specified labels
        const removeResult = await Organization.updateOne(
            { workspace: req.workspace },
            { $pull: { labels: { $in: labelsToRemove } } }
        );
        console.log('Removed labels:', removeResult);

        //Then, add a new label if it doesn't exist
        const addResult = await Organization.updateOne(
            { workspace: req.workspace },
            { $addToSet: { labels: labelToAdd } }
        );
        console.log('Added label:', addResult);

        //Next, push a label to the end of the array
        const pushResult = await Organization.updateOne(
            { workspace: req.workspace },
            { $push: { labels: labelToPush } }
        );
        console.log('Pushed label:', pushResult);

        // Finally, replace the entire labels array
        const replaceResult = await Organization.updateOne(
            { workspace: req.workspace },
            { $set: { labels: labelsToReplace } }
        );
        console.log('Replaced labels:', replaceResult);

        res.status(200).json({
            message: 'Labels updated successfully',
            });
    } catch (error) {
        console.error('Error updating labels:', error);
        res.status(500).json({ error: 'An error occurred while updating the labels', details: error.message });
    }
});

module.exports =router;
