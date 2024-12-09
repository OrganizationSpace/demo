const zlib = require('zlib');

const Customer = require('../models/Customer');
const Organization = require('../models/Organization');

class LabelController {
    // Method to add a label to the organization
     async addLabel({labels, workspace}) {
        try {
            console.log("11");
            
            // Find the organization by workspace and add labels using $addToSet
            const updatedOrganization = await Organization.findOneAndUpdate(
                { workspace: workspace },  // Filter by workspace
                { $addToSet: { labels :labels} },  // Ensure labels are unique using $addToSet
                { new: true }               // Return the updated document
            );
            console.log("update",updatedOrganization);

            // Return the updated organization with the new labels
            return updatedOrganization;
        } catch (error) {
            // Handle errors if the update fails
            throw new Error('An error occurred while updating labels');
        }
    }

    async listLabel({workspace}) {
        try {
            console.log("11");
            
            // Find the organization by workspace and add labels using $addToSet
            const labelList = await Organization.findOne(
                { workspace }, // Filter: Match by the workspace extracted from the token
                { labels: 1, _id: 0 } // Projection: Include only the `labels` field, exclude the `_id` field
            );

            // Return the updated organization with the new labels
            return labelList;
        } catch (error) {
            // Handle errors if the update fails
            throw new Error('An error occurred while updating labels');
        }
    }

    async deleteLabel({labels, workspace}) {
        try {
            console.log("11");
            
            const deleteLabel = await Organization.updateOne(
                { workspace }, // Filter: Match by the workspace
                { $pull: { labels: labels } }, // Update: Remove all labels that match any in the array
                { new: true } // Option: Ensure the response contains the updated document
            );
    
            console.log("update",deleteLabel);

            // Return the updated organization with the new labels
            return deleteLabel;
        } catch (error) {
            // Handle errors if the update fails
            throw new Error('An error occurred while updating labels');
        }
    }

    async assignLabel({ label, workspace, customerIds }) {
    try {
        console.log("Starting label assignment...");

        // Decode and decompress `customerIds`
        const decodedBuffer = Buffer.from(customerIds, 'base64');
        console.log("Decoded Buffer:", decodedBuffer.toString()); // Debug decoded buffer

        const decompressedBuffer = await new Promise((resolve, reject) => {
            zlib.gunzip(decodedBuffer, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log("Decompressed Buffer:", decompressedBuffer.toString()); // Debug decompressed buffer

        const decryptedData = JSON.parse(decompressedBuffer.toString('utf-8'));
        console.log("Decrypted Data:", decryptedData); // Debug parsed JSON

        const ids = decryptedData.ids; // Use IDs directly
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error("Decrypted IDs are missing or invalid");
        }
        console.log("Decrypted IDs:", ids);

        // Log the workspace
        console.log("Workspace:", workspace);

        // Update the customers in the database
        const updateResult = await Customer.updateMany(
            { _id: { $in: ids }, workspace }, // Filter by customer IDs and workspace
            { $addToSet: { labels: label } }  // Add the label, avoiding duplicates
        );

        console.log("Update Result:", updateResult);

        if (!updateResult.acknowledged) {
            throw new Error('Database update operation was not acknowledged.');
        }

        if (updateResult.matchedCount === 0) {
            throw new Error('No matching customers found for the provided IDs and workspace.');
        }

        return {
            message: 'Label assigned successfully to customers.',
            updateResult,
        };
    } catch (error) {
        console.error("Error in assignLabel:", error.message);
        throw new Error(`Error assigning label to customers: ${error.message}`);
    }
    }

}
// // Add a label to the organization
// const addLabel = async (req, res) => {
//     const { labels } = req.body;

//     try {
//         const addLabel = await Organization.findOneAndUpdate(
//             { workspace: req.workspace },
//             { $addToSet: { labels } },
//             { new: true }
//         );
//         res.status(200).json(addLabel);
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while updating labels' });
//     }
// };

// // List labels in the organization
// const listLabels = async (req, res) => {
//     try {
//         const labelList = await Organization.findOne(
//             { workspace: req.workspace },
//             { labels: 1, _id: 0 }
//         );
//         res.status(200).json(labelList);
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while fetching labels' });
//     }
// };

// // Delete labels from the organization
// const deleteLabel = async (req, res) => {
//   //Extract the `labels` array from the request body
//   const { labels } = req.body;

//   console.log(req.body);
//   console.log(req.workspace);

//   try {
//       //Use `updateOne` to find the organization by the workspace and remove labels
//       const deleteLabel = await Organization.updateOne(
//           { workspace: req.workspace }, // Filter: Match by the workspace
//           { $pull: { labels: labels } }, // Update: Remove all labels that match any in the array
//           { new: true } // Option: Ensure the response contains the updated document
//       );

//       console.log(deleteLabel);

//       res.status(200).json({ message: 'Labels deleted from documents', deleteLabel });
//   } catch (error) {
//       res.status(500).json({ error: 'An error occurred while deleting the labels' });
//   }
// };

// // Assign a label to customers
// const assignLabel = async (req, res) => {
//     const { label ,encodedString} = req.body;

//     try {
//         // Decode and decompress the encrypted data
//         //const encodedString = req.body.customerIds;
//         const decryptedData = await decryptedCustomerIds(encodedString);
        
       

//         const ids = decryptedData.ids;
//         console.log("ids",ids);
        
//         // Update customers in the database
//         const updateResult = await Customer.updateMany(
//             { _id: { $in: ids }, workspace: req.workspace },
//             { $addToSet: { labels: label } }
//         );

//         res.status(200).json({
//             message: `Label assigned successfully to customers.`,
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error assigning label to customers', error: error.message });
//     }
// };


// // Encrypt customer IDs
// const encryptCustomerIds = (req, res) => {
//     const { customerIds } = req.body;

//     try {
//         // Compress and encode the customer IDs
//         const base64Encoded = compressData(customerIds);

//         res.status(200).json({ encryptedData: base64Encoded });
//     } catch (error) {
//         res.status(500).json({ message: 'Encryption failed', error: error.message });
//     }
// };

// // Test database operations
// const testOperators = async (req, res) => {
//     const { labelsToRemove, labelToAdd, labelsToReplace, labelToPush } = req.body;

//     try {
//         await Organization.updateOne(
//             { workspace: req.workspace },
//             { $pull: { labels: { $in: labelsToRemove } } }
//         );

//         await Organization.updateOne(
//             { workspace: req.workspace },
//             { $addToSet: { labels: labelToAdd } }
//         );

//         await Organization.updateOne(
//             { workspace: req.workspace },
//             { $push: { labels: labelToPush } }
//         );

//         await Organization.updateOne(
//             { workspace: req.workspace },
//             { $set: { labels: labelsToReplace } }
//         );

//         res.status(200).json({ message: 'Labels updated successfully' });
//     } catch (error) {
//         res.status(500).json({ error: 'An error occurred while updating the labels', details: error.message });
//     }
// };

module.exports = LabelController;  

