const express = require('express');
const { 
    addLabel, 
    listLabels, 
    deleteLabel, 
    assignLabel, 
    encryptDataHandler, 
    testOperators 
} = require('../controllers/labelController');
const authorization = require('../functions/auth');

const router = express.Router();

// Define routes and map them to controller functions
router.post('/add', authorization, addLabel);
router.get('/list', authorization, listLabels);
router.post('/delete', authorization, deleteLabel);
router.post('/assigns', authorization, assignLabel);
router.post('/encrypt', encryptDataHandler);
router.post('/test', authorization, testOperators);

module.exports = router;
