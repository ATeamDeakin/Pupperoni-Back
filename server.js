const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const User = require("./models/user")
multer = require("multer")
const saltRounds = 10
const controller = require("./controller/serverController")
const jwt = require("jsonwebtoken")
require('dotenv').config();


//app
let app = express();
const cors = require("cors");

app.use(

    cors({

        origin: "*",

    })

);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const URI = process.env.DB_PROTOCOL + "://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@" + process.env.DB_HOST + process.env.DB_CONNECTIONOPTIONS;
mongoose.connect(URI, { useNewUrlParser: true })

//send user value to MongoDB
app.post('/signup', (req, res) => {
    controller.PostNewUser(req, res)
})

//find all user
app.get('/user', validateToken, (req, res) => {
    controller.FindAllUser(req, res)
})

//find specific user with user ID or username
app.get('/user/:id', validateToken, (req, res) => {
    controller.FindUser(req, res)
})

//change with user id or username
app.patch('/user/:id', validateToken, (req, res) => {
    controller.UpdateUser(req, res)
})

app.post("/refreshToken", (req, res) => {
    controller.RefreshToken(req, res)
})
//delete with user ID or username
app.delete('/user/:id', validateToken, (req, res) => {
    controller.DeleteUserID(req, res)
})

//find a user with username: return password
app.post('/login', (req, res) => {
    controller.PostLogin(req, res)
})

app.delete("/logout", (req, res) => {
    controller.Logout(req, res)
})

app.get('/like/:id', (req, res) => {
    controller.Like(req, res)
})

// Set storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage })

//Upload picture for certain user
app.patch("/user/:id/uploadphoto", upload.single('myImage'), validateToken, (req, res) => {
    controller.UploadUserPicture(req, res)
})

// Get profile picture
app.get('/user/:id/picture', validateToken, (req, res, next) => {
    controller.GetUserPicture(req, res)
});

function validateToken(req, res, next) {
    //get token from request header
    const authHeader = req.headers["authorization"]
    const token = authHeader.split(" ")[1]
    //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
    if (token == null) res.sendStatus(400).send("Token not present")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(403).send("Token invalid")
        }
        else {
            req.username = user
            next() //proceed to the next action in the calling function
        }
    }) //end of jwt.verify()
}

//listen to 8080 port
app.listen(process.env.SERVER_PORT, function (req, res) {
    console.log("Web server is running on " + process.env.SERVER_PORT + "...");
})


module.exports = app;
