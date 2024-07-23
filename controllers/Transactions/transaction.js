const { db, firebase } = require('../../config/admin');

// Fetch all transactions for all users
const getAllTransactions = async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        let transactions = [];

        for (const userDoc of usersSnapshot.docs) {
            const walletsSnapshot = await db.collection('users').doc(userDoc.id).collection('wallet').get();
            for (const walletDoc of walletsSnapshot.docs) {
                const transactionsSnapshot = await db.collection('users').doc(userDoc.id).collection('wallet').doc(walletDoc.id).collection('transactions').get();
                transactionsSnapshot.forEach(transactionDoc => {
                    transactions.push({ 
                        userId: userDoc.id,
                        walletId: walletDoc.id,
                        transactionId: transactionDoc.id, 
                        ...transactionDoc.data() 
                    });
                });
            }
        }

        res.render('Transactions/displayTransactions', { transactions: transactions });
        // res.json(transactions)
    } catch (error) {
        res.status(500).send('Error fetching transactions: ' + error.message);
    }
};

const getTransactionDetails = async (req, res) => {
    try {
        const { userId, walletId } = req.params;
        const transactionsSnapshot = await db.collection('users').doc(userId).collection('wallet').doc(walletId).collection('transactions').get();

        let transactions = [];
        transactionsSnapshot.forEach(transactionDoc => {
            let transactionData = transactionDoc.data();
            if (transactionData.date && transactionData.date.toDate) {
                transactionData.date = transactionData.date.toDate(); 
            }
            transactions.push({
                id: transactionDoc.id,
                ...transactionData,
                userId: userId,
                walletId: walletId
            });
        });

        res.render('Transactions/transactionDetails', { transactions: transactions });
    } catch (error) {
        res.status(500).send('Error fetching transactions: ' + error.message);
    }
};

const getSingleTransactionDetails = async (req, res) => {
    try {
        const { userId, walletId, transactionId } = req.params;
        const transactionDoc = await db.collection('users').doc(userId).collection('wallet').doc(walletId).collection('transactions').doc(transactionId).get();

        if (!transactionDoc.exists) {
            return res.status(404).send('Transaction not found');
        }

        const transactionData = transactionDoc.data();
        if (transactionData.date && transactionData.date.toDate) {
            transactionData.date = transactionData.date.toDate();
        }

        res.render('Transactions/transactionDetailsView', { transaction: { id: transactionDoc.id, ...transactionData } });
        // res.json(transactionData)
    } catch (error) {
        res.status(500).send('Error fetching transaction details: ' + error.message);
    }
};



module.exports = {
    getAllTransactions,
    getTransactionDetails,
    getSingleTransactionDetails
};
