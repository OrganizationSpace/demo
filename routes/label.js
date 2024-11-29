const express = require('express');
const authorization = require('../functions/auth');
const Customer = require('../models/Customer');
const { encryptIDs, decryptIDs } = require('../functions/utils');
const Organization = require('../models/Organization');

const router = express.Router();


//Add a labels 
router.post('/add',authorization, async (req, res) => {
    const { labels } = req.body;
    try {
        console.log(req.body);
        console.log("Workspace:", req.workspace);
        // Directly update the labels by email
        const updatedList = await Organization.findOneAndUpdate({
            workspace:req.workspace}, // Filter by the provided email
            { $addToSet: { labels: labels}},// Use $each to add multiple labels//update and avoid duplicates
            { new: true } // Return the updated document
        );
        console.log("list",updatedList);
        
        res.status(200).json(updatedList);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating labels' });
    }
});

//List the labels one user
router.post('/list', authorization,async (req, res) => {
    try {
        const labelList = await Organization.findOne(
            { workspace:req.workspace}, // Filter by the provided email
            { labels: 1, _id: 0 } // Include only the `labels` field, exclude `_id`
        );
        res.status(200).json(labelList);
    } catch (error) {
        console.error('Error fetching labels:', error);
        res.status(500).json({ error: 'An error occurred while fetching labels' });
    }
});

//Delete the labels 
router.post('/delete',authorization, async (req, res) => {
    const { labels } = req.body;
    console.log(req.body);
    

    try {
        const result = await Organization.updateOne(
            { workspace:req.workspace }, // Filter by the provided email
            { $pull: { labels:  labels  } }, // Pull labels matching any in the array
            { new: true } 
        );
        console.log(result);
        
        res.status(200).json({ message: 'Labels deleted from  documents',result });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the labels' });
    }
});

//Asign label
router.post('/assign-labels', authorization,async (req, res) => {
    const { customerIds,  label } = req.body;

    try {
        console.log(req.body);

        // Fetch the organization based on the workspace
        const organization = await Organization.findOne({ workspace:req.workspace });
        if (!organization) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // // Check if the provided label exists in the organization's labels
        // if (!organization.labels.includes(label)) {
        //     return res.status(400).json({ message: 'The provided label does not exist in the organization' });
        // }

        // Encrypt the customer IDs
        const encryptedId = encryptIDs(customerIds);
        console.log(`Encrypted Data: ${encryptedId}`);

        // Update the database for all customer IDs
        const updateResult = await Customer.updateMany(
            { _id: { $in: customerIds } }, // Filter for customer IDs
            { $addToSet: { labels: label } }, // Add the single label to customers
            { new: true } // Option to return updated documents
        );

        // Extract matchedCount and modifiedCount from the MongoDB response
        // const { matchedCount, modifiedCount } = updateResult;

        // Respond with the encrypted IDs and update counts
        res.status(200).json({
            message: `Label  assigned successfully from organization`,
        });
    } catch (error) {
        console.error('Error assigning label:', error);
        res.status(500).json({ message: 'Error assigning label to customers', error: error.message });
    }
});

//decrypt
router.post('/decrypt-ids', async (req, res) => {
    const { encryptedId } = req.body;

    try {
        // Decrypt the encrypted ID
        const ids = decryptIDs(encryptedId);
        console.log('Decrypted IDs:', ids);

        // Respond with the original IDs
        res.status(200).json({
            message: 'IDs decrypted successfully',
            ids
        });
    } catch (error) {
        console.error('Error decrypting IDs:', error);
        res.status(500).json({ message: 'Error decrypting IDs', error: error.message });
    }
});
 
module.exports =router;