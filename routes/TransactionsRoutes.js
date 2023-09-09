const express = require('express');
const router = express.Router();
const { verifyAccessToken, verifyUserToken } = require("../middlewares/auth")
const {
    getAllTransactionsOfUser
} = require('../controllers/TransactionsControllers')

// get all transactions  of any user
router.get('/api/v1/:token/transactions/:userId', verifyAccessToken, verifyUserToken, getAllTransactionsOfUser)



module.exports = router;