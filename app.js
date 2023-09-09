const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config({
    path: './.env'
})
app.use(cookieParser())

require('./db/conn')
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.use(cors({ credentials: true, origin: true }))


// getting required general functions
const { addNewRecord, fetchSingleRecord, fetchAllRecords, updateSingleRecord, deleteSingleRecord } = require("./controllers/genericCRUD")
const { verifyToken } = require("./utils/utils")
const { verifyUserToken, verifyIpAddress } = require("./middlewares/auth")

// adding routes
app.use(require('./routes/UsersRoutes'))
app.use(require('./routes/UploadRoutes'))
app.use(require('./routes/UserActivitiesRoutes'))
app.use(require('./routes/TransactionsRoutes'))


// writing path for images getting
app.use('/uploads', express.static('uploads'));

// in case any unhandled exceptions occurs this will prevent server from crashing
process.on('uncaughtException', function (err) {
    console.error("UnExpected Error Occurred in App: ", err);
    console.log("App is Prevented from Crashing SuccessFully");
});

// checking if app is running
app.get('/', (req, res) => {
    res.send({ isConnected: true, message: "Server App is Running SuccessFully" })
})


const port = 8080

app.listen(port, (req, res) => {
    console.log(`Express Server Running at ${port}`)
})



// adding new record
app.post('/api/v1/add/:token/:collectionName', verifyIpAddress, async (req, res) => {
    try {
        const { collectionName, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token)
        if (isTokenVerified?.success == true) { // if token is valid
            let response = await addNewRecord(collectionName, req.body) // sending data to generic add function
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// fetching single record from any collection
app.get('/api/v1/fetchSingleRecord/:token/:collectionName/:id', verifyIpAddress, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token)
        if (isTokenVerified?.success == true) {
            let response = await fetchSingleRecord(collectionName, id) // sending data to generic get single record function
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


// fetching all records from any collection
app.get('/api/v1/fetch/:token/:collectionName/:limit', verifyIpAddress, async (req, res) => {
    try {
        const { collectionName, limit, token, role } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token)
        if (isTokenVerified?.success == true) { // if valid
            let response = await fetchAllRecords(collectionName, limit, req.query)
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


// updating any single record from any collection
app.put('/api/v1/edit/:token/:collectionName/:id', verifyIpAddress, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token)
        if (isTokenVerified?.success == true) { // if valid
            let response = await updateSingleRecord(collectionName, id, req.body)  // sending data for updation
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


// delete single record from any collection
app.delete('/api/v1/delete/:token/:collectionName/:id', verifyIpAddress, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token)
        if (isTokenVerified?.success == true) { //if valid
            let response = await deleteSingleRecord(collectionName, id)  // sending id for deletion
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});



////   ======   Secure  Generic  Api  Routes =======    //////

// adding new record secure
app.post('/api/v1/add/secure/:token/:collectionName', verifyIpAddress, verifyUserToken, async (req, res) => {
    try {
        const { collectionName, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token, collectionName)
        if (isTokenVerified?.success == true) { // if token is valid
            let response = await addNewRecord(collectionName, req.body, req.userId, req.role) // sending data to generic add function
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// fetching all records from any collection
app.get('/api/v1/fetch/secure/:token/:collectionName/:limit', verifyIpAddress, verifyUserToken, async (req, res) => {
    try {
        const { collectionName, limit, token, role } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token, collectionName)
        if (isTokenVerified?.success == true) { // if valid
            let response = null
            if (req.query) {
                response = await fetchAllRecords(collectionName, limit, req.query, req.userId, req.role)
            } else {
                response = await fetchAllRecords(collectionName, limit, null, req.userId, req.role)
            }
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// fetching single record from any collection
app.get('/api/v1/fetchSingleRecord/secure/:token/:collectionName/:id', verifyIpAddress, verifyUserToken, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token, collectionName)
        if (isTokenVerified?.success == true) {
            let response = await fetchSingleRecord(collectionName, id, req.userId, req.role) // sending data to generic get single record function
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// updating any single record from any collection
app.put('/api/v1/edit/secure/:token/:collectionName/:id', verifyIpAddress, verifyUserToken, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token, collectionName)
        if (isTokenVerified?.success == true) { // if valid
            let response = await updateSingleRecord(collectionName, id, req.body, req.userId, req.role)  // sending data for updation
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// delete single record from any collection
app.delete('/api/v1/delete/secure/:token/:collectionName/:id', verifyIpAddress, verifyUserToken, async (req, res) => {
    try {
        const { collectionName, id, token } = req.params;
        // verifying if token is valid
        let isTokenVerified = await verifyToken(token, collectionName)
        if (isTokenVerified?.success == true) { //if valid
            let response = await deleteSingleRecord(collectionName, id, req.userId, req.role)  // sending id for deletion
            console.log("==response==", response?.success)
            return res.json(response);
        } else {
            return res.json(isTokenVerified)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});