const User = require("../models/User")
const bcrypt = require("bcrypt")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const saltRounds = 10
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
        //encrypt + hash
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        User.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    username: req.body.username,
                    password: hash,
                    telephone: req.body.telephone,
                    email: req.body.email,
                },
            },
            (err) => {
                if (!err) {
                    res.send("Successfully update a user with user id");
                } else {
                    User.updateOne(
                        { username: req.params.id },
                        {
                            $set: {
                                username: req.body.username,
                                password: hash,
                                telephone: req.body.telephone,
                                email: req.body.email,
                            },
                        },
                        (err) => {
                            if (!err) {
                                res.send("Successfully update a user with username");
                            } else {
                                res.send("User does not exist");
                            }
                        }
                    );
                }
            }
        );
    } catch (err) {
        console.error(`Error while updating user:`, err.message);
    }
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}
// refreshTokens
let refreshTokens = []
function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "20m" })
    refreshTokens.push(refreshToken)
    return refreshToken
}

function RefreshToken(req, res) {
    if (!refreshTokens.includes(req.body.token)) res.status(400).send("Refresh Token Invalid")
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)
    //remove the old refreshToken from the refreshTokens list
    const accessToken = generateAccessToken({ user: req.body.username })
    const refreshToken = generateRefreshToken({ user: req.body.username })
    //generate new accessToken and refreshTokens
    res.json({ accessToken: accessToken, refreshToken: refreshToken })

}

function Logout(req, res) {
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)

    res.status(204).send("Logged out")
}

//Upload picture for certain user with user ID or username
async function UploadUserPicture(req, res) {
    try {
        var img = fs.readFileSync(req.file.path);
        fs.unlinkSync(req.file.path);
        var encode_img = img.toString('base64');
        var final_img = {
            contentType: req.file.mimetype,
            data: new Buffer(encode_img, 'base64')
        };
        console.log(final_img)
        User.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    img: final_img
                }
            },
            (err) => {
                if (!err) { res.send('Successfully upload a picture for a user with user id') }
                else {
                    User.updateOne(
                        { username: req.params.id },
                        {
                            $set: {
                                img: final_img
                            }
                        },
                        (err) => {
                            if (!err) { res.send('Successfully upload a picture for a user with username') }
                            else {
                                res.send("User does not exist")
                            }
                        }
                    )
                }
            }
        )
    } catch (err) {
        console.error(`Error while updating user picture:`, err.message);
    }
}

// Get profile picture with user ID or username
async function GetUserPicture(req, res) {
    try {
        User.findById(req.params.id, (err, user) => {
            if (!err) {
                res.contentType(user.img.contentType);
                res.send(user.img.data);
            } else {
                User.findOne({ username: req.params.id }, (err, user) => {
                    if (user) {
                        res.contentType(user.img.contentType);
                        res.send(user.img.data);
                    } else {
                        res.send(err);
                    }
                })
            }
        });
    } catch (err) {
        console.error(`Error while getting user picture:`, err.message);
    }
}

module.exports = {
    PostNewUser,
    PostLogin,
    FindAllUser,
    FindUser,
    DeleteUserID,
    UpdateUser,
    UploadUserPicture,
    RefreshToken,
    Logout,
    GetUserPicture
}


