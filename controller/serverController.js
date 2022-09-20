const User = require("../models/User")
const bcrypt = require("bcrypt")
const fs = require("fs")

require("dotenv").config()

const port = process.env.TOKEN_SERVER_PORT


//send user value to MongoDB
async function PostNewUser(req, res) {
    try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);

        var img = fs.readFileSync("./uploads/default.jpg");
        var encode_img = img.toString('base64');
        var final_img = {
            contentType: "image/jpeg",
            data: new Buffer(encode_img, 'base64')
        };

        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: hash,
            phone: req.body.phone,
            availability: req.body.availability,
            dog_name: req.body.dog_name,
            dog_age: req.body.dog_age,
            size: req.body.size,
            dog_friendliness: req.body.dog_friendliness,
            people_friendliness: req.body.people_friendliness,
            prey_drive: req.body.prey_drive,
            training: req.body.training,
            img: final_img
        });

        user.save().catch((err) => res.send(err));

        if (res.statusCode === 200) {
            res.send("Success send!");
        }
        else {
            res.send("Something wrong?");
        }
    } catch (err) {
        console.error(`Error while posting new user:`, err.message);
    }
}

//login with username and password (generates access token)
function PostLogin(req, res) {
    try {
        User.findOne({ username: req.body.username }, async (err, list) => {
            if (list == null) res.status(404).send("User does not exist")
            const match = bcrypt.compare(req.body.password, list.password)
            if (await bcrypt.compare(req.body.password, list.password)) {
                const accessToken = generateAccessToken({ user: req.body.name })
                const refreshToken = generateRefreshToken({ user: req.body.name })
                res.json({ accessToken: accessToken, refreshToken: refreshToken })

            }
            else {
                res.status(401).send("Password Incorrect")
            }
        }
        )
    } catch (err) {
        console.error(`Error while sending login request:`, err.message);
    }
}

module.exports = {
    
}
