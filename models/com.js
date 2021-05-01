const { iteratee } = require("lodash");
const mongoose = require("mongoose");
const comSchema = new mongoose.Schema({
    subject: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    category: String,
    customCategory: String,
    description: String,
    communityposts: [{
        postcontent: String,
        title: String,
        writer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        like: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        }],
        comcomments: [{
            username: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            },
            message: String,
            comcommentreplies: [{
                replyuser: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Item"
                },
                replymessage: String,
                replylayer2: [{
                    replylayer2user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Item"
                    },
                    replylayer2message: String,
                    replylayer3: [{
                        replylayer3user: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Item"
                        },
                        replylayer3message: String,
                        replylayer4: [{
                            replylayer4user: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Item"
                            },
                            replylayer4message: String,

                        }],
                    }],
                }],
            }],
        }],
        communitypostsimage: String,
        reportId: String,
        Date: "",
        report: [{
            reporter: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            },
            reason: String,
            reportdescription: String
        }],

    }],
    comments: [{
        username: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        message: String
    }],
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    rating: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    comimage: String,
    Date: "",
    communitytotalrankpoints: Number,
    report: String,

})
const Com = mongoose.model("Com", comSchema)
module.exports = Com