const mongoose = require("mongoose")
const validator = require("validator")
const userSchema = new mongoose.Schema(
    {
        username: String,
        firstname: String,
        lastname: String,
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is not valid!')
                }
            }
        },
        password: { type: String, minlength: 8, required: true },
        phone: Number,
        availability: Date,
        dog_name: String,
        dog_age: Number,
        size: String,
        dog_friendliness: Number,
        people_friendliness: Number,
        prey_drive: Number,
        training: String,
        img: { data: Buffer, contentType: String }
    }
)
module.exports = mongoose.model("User", userSchema)
