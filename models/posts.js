const { uniqueId } = require("lodash");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    comments: [{
        username: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        message: String,
        Date: ""
    }],
    topic: String,
    title: String,
    content: String,
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    chat: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        message: String
    }],
    community: {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Com"
        },
        message: String
    },
    postimage: String,
    Date: ""

});
const Post = mongoose.model("Post", postSchema);
module.exports = Post