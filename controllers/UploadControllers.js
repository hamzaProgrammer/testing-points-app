const { getCollectionName } = require("../utils/utils")
const path = require('path');


// upload image/files
const uploadFile = async (req, res) => {
    if (!req.file || !req.params.id || !req.params.collectionName) {
        return res.json({ success: false, message: "Please fill required fields" })
    } else {
        try {
            //console.log("===req.file.path =====", req.file.path)

            let collectionName = getCollectionName(req.params.collectionName)
            if (!collectionName) {
                return res.json({ success: false, message: "Collection not found" })
            }
            // finding collection
            let isFound = await collectionName.findById(req.params.id)
            if (!isFound) {
                return res.json({ success: false, message: "Record not found" })
            }
            console.log("== fileName", req.file.path)
            // isFound.image = path.basename(req.file.path)
            isFound.image = req.file.path

            if (req.params.collectionName == "UniversexVehicles" || req.params.collectionName == "UniversexActivities") {
                if (req.role == "user") {
                    return res.status(401).json({ success: false, message: "Access Denied!" })
                }
            }
            if (req.params.collectionName == "UniversexUsers") {
                if (req.role == "user") {
                    if (isFound?._id != req.userId) {
                        return res.status(401).json({ success: false, message: "Access Denied!" })
                    }
                }
            }

            // updating last login, in case of user
            let isUpdated = await collectionName.findByIdAndUpdate(isFound?._id, { $set: { ...isFound } }, { $new: true })

            if (isUpdated) {
                return res.json({
                    success: true,
                    message: "File uploaded sucessfully",
                    updatedRecord: isFound,
                });
            } else {
                return res.json({
                    success: false,
                    message: "Something went wrong. Please try again",
                });
            }
        } catch (error) {
            console.log("Error in uploadFile and error is : ", error)
            return res.json({
                success: false,
                message: "Something went wrong, Please try again"
            });
        }
    }
}


module.exports = {
    uploadFile
}