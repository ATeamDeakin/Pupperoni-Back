const User = require("../models/User")
const bcrypt = require("bcrypt")
const fs = require("fs")

require("dotenv").config()

const port = process.env.TOKEN_SERVER_PORT


//send user value to MongoDB
async function PostNewUser(req, res) {
    try {
        //encrypt + hash
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
                
                res.status(200).send("Logged in")

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

//find all user
async function FindAllUser(req, res) {
    try {
        User.find((err, list) => {
            if (err) { res.send(err) }
            else { res.send(list) }
        })
    } catch (err) {
        console.error(`Error while getting all users:`, err.message);
    }
}

//find specific user with user ID or username
async function FindUser(req, res) {
    try {
        User.findOne({ _id: req.params.id }, (err, list) => {
            if (list) (res.send(list))
            else {
                User.findOne({ username: req.params.id }, (err, list) => {
                    if (list) {
                        res.send(list)
                    }
                    else res.send("Cannot find a user with given id or username")
                })
            }
        })
    } catch (err) {
        console.error(`Error while getting user by ID:`, err.message);
    }
}

//delete with user ID or username
async function DeleteUserID(req, res) {
    try {
        User.deleteOne({ _id: req.params.id }, function (err, list) {
            if (err) {
                User.deleteOne({ username: req.params.id }, function (err, list) {
                    if (err) {
                        res.send("Cannot find user id or username");
                    }
                    else {
                        res.send(list);
                    }
                })
            } else {
                res.send(list);
            }
        });
    } catch (err) {
        console.error(`Error while deleting user by ID:`, err.message);
    }
}

//change with user ID or username
async function UpdateUser(req, res) {
    try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(req.body.password, salt);
        User.update(
            { _id: req.params.id },
            {
                $set: {
                    //we will add other fields later
                    username: req.body.username,
                    password: hash,
                    phone: req.body.phone,
                    email: req.body.email,
                }
            },
            (err) => {
                if (!err) { res.send('Successfully update a user with user id') }
                else {
                    User.update({ username: req.params.id },
                        {
                            $set: {
                                username: req.body.username,
                                password: hash,
                                phone: req.body.phone,
                                email: req.body.email,
                            }
                        }, (err) => {
                            if (!err) { res.send('Successfully update a user with username') }
                            else {
                                res.send("User does not exist");
                            }
                        }
                    )
                }
            }
        )
    } catch (err) {
        console.error(`Error while updating user:`, err.message);
    }
}

module.exports = {
    PostNewUser,
    PostLogin,
    FindAllUser,
    FindUser,
    DeleteUserID,
    UpdateUser,  
}


