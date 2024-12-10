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
                { workspace},  // Filter by workspace
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

    async assignLabel({ labels, workspace, customerIds }) {
        try {
            console.log("Starting label assignment...");
    
            // Decode and decompress `customerIds`
            const decodedBuffer = Buffer.from(customerIds, 'base64');
            console.log("Decoded Buffer:", decodedBuffer.toString()); // Debug decoded buffer
    
            const decompressedBuffer = await new Promise((resolve, reject) => {
                zlib.gunzip(decodedBuffer, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            console.log("Decompressed Buffer:", decompressedBuffer.toString()); // Debug decompressed buffer
    
            // Parse the decompressed buffer
            const decryptedData = JSON.parse(decompressedBuffer.toString('utf-8'));
            console.log("Decrypted Data:", decryptedData); // Debug parsed JSON
    
            // Log the workspace
            console.log("Workspace:", workspace);
    
            // Update the customers in the database
            const updateResult = await Customer.updateMany(
                { _id: { $in: decryptedData }, workspace }, // Match customers by ID and workspace
                { $addToSet: { labels: labels } } // Add label without duplicates
            );
    
            console.log("Update:", updateResult);
    
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

module.exports = LabelController;  

