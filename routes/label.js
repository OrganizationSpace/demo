const express = require('express');
const authorization = require('../functions/auth');
const Customer = require('../models/Customer');
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
        const addLabel = await Organization.findOneAndUpdate({
            workspace:req.workspace}, // Filter by the provided email
            { $addToSet: { labels: labels}},// Use $each to add multiple labels//update and avoid duplicates
            { new: true } // Return the updated document
        );
        console.log("list",addLabel);
        
        res.status(200).json(addLabel);
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
    console.log(req.workspace);
    

    try {
        const deleteLabel = await Organization.updateOne(
            { workspace:req.workspace }, // Filter by the provided email
            { $pull: { labels:  labels  } }, // Pull labels matching any in the array
            { new: true } 
        );
        console.log(deleteLabel);
        
        res.status(200).json({ message: 'Labels deleted from  documents',deleteLabel });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the labels' });
    }
});

router.post('/encrypt-customer-ids', (req, res) => {
    const { customerIds } = req.body;


    try {
        const jsonString = JSON.stringify(customerIds);
        const compressedBuffer = zlib.gzipSync(jsonString); // Ensure gzipSync is used
        const base64Encoded = compressedBuffer.toString('base64');
        res.status(200).json({ encryptedData: base64Encoded });
    } catch (error) {
        res.status(500).json({ message: 'Encryption failed', error: error.message });
    }
});

//assign
router.post('/assign',authorization, async (req, res) => {
    const { label } = req.body;
    console.log(req.body);
    //console.log(req.workspace);
    
    try {
        //const organization = await Organization.findOne({ workspace: req.workspace });

        const encodedString = req.body.customerIds;
        const decodedBuffer = Buffer.from(encodedString, 'base64');

        console.log("#################################################################");
        console.log("encodedString-------=======>",decodedBuffer);
        console.log("##########################################################################");
console.log("decodedBuffer",decodedBuffer);

        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        console.log("decompressedBuffer",decompressedBuffer);
        

        const decodedString = decompressedBuffer.toString('utf-8');
        console.log("decodedString",decodedString);
        
        req.decryptedData = JSON.parse(decodedString); 
        console.log("decryptedData",req.decryptedData);

        const id = req.decryptedData.ids
console.log("ids",id);

        const updateResult = await Customer.updateMany(
            { _id: { $in:id  },workspace:req.workspace },
            { $addToSet: { labels: label } }
        );

        res.status(200).json({
            message: `Label  assigned successfully to customers.`,
            // matchedCount: updateResult.matchedCount || 0,
            // modifiedCount: updateResult.modifiedCount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning label to customers', error: error.message });
    }
});


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

















