const mongoose = require('mongoose')
const DB = 'mongodb+srv://hamzaMaq:hamza_78674@cluster0.iewu6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: false
}).then(() => {
    console.log("Connection made with MongoDB Atlas")
}).catch((error) => {
    console.log("Connection to MongoD failed", error)
})