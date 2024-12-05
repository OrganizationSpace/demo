const { encryptedCustomerIds, decryptedCustomerIds } = require('../functions/utils');
const Customer = require('../models/Customer');
const Organization = require('../models/Organization');

// Add a label to the organization
const addLabel = async (req, res) => {
    const { labels } = req.body;

    try {
        const addLabel = await Organization.findOneAndUpdate(
            { workspace: req.workspace },
            { $addToSet: { labels } },
            { new: true }
        );
        res.status(200).json(addLabel);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating labels' });
    }
};

// List labels in the organization
const listLabels = async (req, res) => {
    try {
        const labelList = await Organization.findOne(
            { workspace: req.workspace },
            { labels: 1, _id: 0 }
        );
        res.status(200).json(labelList);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching labels' });
    }
};

// Delete labels from the organization
const deleteLabel = async (req, res) => {
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
};

// Assign a label to customers
const assignLabel = async (req, res) => {
    const { label, customerIds } = req.body;

    try {
        const decryptedData = await decryptedCustomerIds(customerIds);
        const customerIDs = decryptedData.ids;

        const updateResult = await Customer.updateMany(
            { _id: { $in: customerIDs }, workspace: req.workspace },
            { $addToSet: { labels: label } }
        );

        res.status(200).json({ message: 'Label assigned successfully to customers.' });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning label to customers', error: error.message });
    }
};

// Encrypt customer IDs
const encryptDataHandler = async (req, res) => {
    const { customerIds } = req.body;

    try {
        const encryptedData = encryptedCustomerIds(customerIds);
        res.status(200).json({ encryptedData });
    } catch (error) {
        res.status(500).json({ message: 'Encryption failed', error: error.message });
    }
};

// Test database operations
const testOperators = async (req, res) => {
    const { labelsToRemove, labelToAdd, labelsToReplace, labelToPush } = req.body;

    try {
        await Organization.updateOne(
            { workspace: req.workspace },
            { $pull: { labels: { $in: labelsToRemove } } }
        );

        await Organization.updateOne(
            { workspace: req.workspace },
            { $addToSet: { labels: labelToAdd } }
        );

        await Organization.updateOne(
            { workspace: req.workspace },
            { $push: { labels: labelToPush } }
        );

        await Organization.updateOne(
            { workspace: req.workspace },
            { $set: { labels: labelsToReplace } }
        );

        res.status(200).json({ message: 'Labels updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the labels', details: error.message });
    }
};

module.exports = {
    addLabel,
    listLabels,
    deleteLabel,
    assignLabel,
    encryptDataHandler,
    testOperators
};
