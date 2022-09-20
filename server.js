const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

require('dotenv').config();


//app
const app = express();
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


//listen to 8080 port
app.listen(process.env.SERVER_PORT, function (req, res) {
    console.log("Web server is running in " + process.env.SERVER_PORT + "...");
})
