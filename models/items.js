const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require('mongoose-findorcreate');

const Post = require("../models/posts");

require("../node");
const loginSchema = new mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    name: String,
    fullname: String,
    cityname: String,
    academics: String,
    institute: String,
    phonenumber: String,
    emailid: String,
    address: String,
    pincode: String,
    profileimage: String,
    googleprofileimage: String,
    facebookprofileimage: String,
    googleId: String,
    facebookId: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    //relationships must be established
    topics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic"
    }],
    //when the user likes or dislikes a particular post
    like: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    like: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Com"
    },
    dislike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Com",
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    com: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Com"
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Com",
    }],
    Mod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mod"
    },
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coff"
    },
    Date: ""
});
loginSchema.plugin(passportLocalMongoose);
loginSchema.plugin(findOrCreate);
const Item = mongoose.model("Item", loginSchema);
module.exports = Item