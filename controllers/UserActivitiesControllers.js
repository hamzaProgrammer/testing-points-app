const UserActivities = require('../models/UserActivitySchema')

// get all user activities of any user
const getAllUserActivitiesOfUser = async (req, res) => {
    if (!req.params.userId) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            let isUserActivities = await UserActivities.find({ user: req.params.userId });

            if (!isUserActivities) {
                return res.json({ success: false, message: "User Activities not found" })
            }

            if (req.role == "user") {
                return res.json({ success: false, message: "Access Denied!" })
            }

            return res.json({
                success: true,
                UserActivies: isUserActivities,
            });
        } catch (error) {
            console.log("Error in getAllUserActivitiesOfUser and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}


module.exports = {
    getAllUserActivitiesOfUser
}