const Notifications = require('../models/NotificationsSchema')

// add new read by of any notification
const updateReadByOfAnyNotification = async (req, res) => {
    if (!req.userId) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            if (req.role == "user") {
                return res.json({ success: false, message: "Access Denied!" })
            }

            const result = await Notifications.updateMany(
                { readBy: { $nin: [req.userId] } },
                { $addToSet: { readBy: req.userId } }
            );

            return res.json({
                success: true,
                message: "Action successful",
            });
        } catch (error) {
            console.log("Error in updateReadByOfAnyNotification and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}


module.exports = {
    updateReadByOfAnyNotification
}