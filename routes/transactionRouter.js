const express = require('express');
const router = express.Router();

const { getAllTransactions, getTransactionDetails, getSingleTransactionDetails } = require('../controllers/Transactions/transaction');

// Fetch all transactions
router.get('/getTransaction', getAllTransactions);

// Fetch details for all transaction of a user
router.get('/:userId/:walletId/:transactionId', getTransactionDetails);

// Fetch details for a single transaction of a particular user 
router.get('/single/:userId/:walletId/:transactionId', getSingleTransactionDetails);

module.exports = router;
