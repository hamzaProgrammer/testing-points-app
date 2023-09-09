const Transactions = require('../models/TransactionsSchema')

// get all user transactions of any user
const getAllTransactionsOfUser = async (req, res) => {
    if (!req.params.userId) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            let isUserActivities = await Transactions.find({ user: req.params.userId });

            if (!isUserActivities) {
                return res.json({ success: false, message: "No transactions found" })
            }

            if (req.role == "user") {
                return res.json({ success: false, message: "Access Denied!" })
            }

            return res.json({
                success: true,
                UserTransactions: isUserActivities,
            });
        } catch (error) {
            console.log("Error in getAllTransactionsOfUser and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}


module.exports = {
    getAllTransactionsOfUser
}