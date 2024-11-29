const express = require('express');
const authorization = require('../functions/auth');
const Customer = require('../models/Customer');
const { encryptIDs, decryptIDs } = require('../functions/utils');
const Organization = require('../models/Organization');
const zlib = require('zlib');


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
router.get('/list', authorization,async (req, res) => {
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
router.post('/assign-labels', authorization, async (req, res) => {
    const { label,customerIds } = req.body;
    // const encodedString = req.body.customerIds; // Base64 encoded customer IDs
    try {
        console.log("Request Body:", req.body);

        // Step 1: Fetch the organization based on the workspace
        const organization = await Organization.findOne({ workspace: req.workspace });
        if (!organization) {
            return res.status(404).json({ message: 'Workspace not found' });
        }
console.log('Organization',organization);

        // Step 2: Check if the provided label exists in the organization's labels
        if (!organization.labels.includes(label)) {
            return res.status(400).json({ message: 'The provided label does not exist in the organization' });
        }

        // Step 3: Decode and decompress customer IDs
        let decodedString;
        try {
            const decodedBuffer = Buffer.from(customerIds, 'base64'); // Decode Base64 string
            console.log(decodedBuffer);
            
            const decompressedBuffer = await new Promise((resolve, reject) => {
                zlib.gunzip(decodedBuffer, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            console.log(decompressedBuffer);
            
            decodedString = decompressedBuffer.toString('utf-8'); // Convert buffer to string
        } catch (err) {
            console.error('Error decompressing customer IDs:', err);
            return res.status(400).json({ message: 'Invalid or corrupted customer IDs', error: err.message });
        }

        // Step 4: Parse the decoded string into an array of customer IDs
        let decodeCustomerIds;
        try {
            decodeCustomerIds = JSON.parse(decodedString); // Parse JSON string
        } catch (err) {
            console.error('Error parsing JSON:', err);
            return res.status(400).json({ message: 'Invalid JSON in customer IDs', error: err.message });
        }

        console.log("Decrypted Customer IDs:", decodeCustomerIds);

        // Step 5: Update the database for the provided customer IDs
        const updateResult = await Customer.updateMany(
            { _id: { $in: decodeCustomerIds } }, // Filter: Customers whose IDs match
            { $addToSet: { labels: label } }, // Update: Add the label to the "labels" array
            { new: true } // Option: Return the updated documents
        );

        console.log('Update Result:', updateResult);

        // Step 6: Respond with success
        res.status(200).json({
            message: `Label "${label}" assigned successfully to customers.`,
            // matchedCount: updateResult.matchedCount || 0,
            // modifiedCount: updateResult.modifiedCount || 0,
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