    require('dotenv').config();
    const express = require("express");
    const app = express();
    ///////////////////////////////////
    const http = require("http").createServer(app);
    const nodemon = require("nodemon");
    ///////////////////////////////////
    const routes = require("./routes/routes");
    ///////////////////////////////////
    const mongoose = require("mongoose")
        ///////////////
    const expressSession = require("express-session");
    const session = require("express-session");
    const passport = require("passport");
    const passportLocalMongoose = require("passport-local-mongoose");
    ///////For login With Google/////////
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    //////For login With Facebook////////
    const FacebookStrategy = require("passport-facebook").Strategy;
    const findOrCreate = require('mongoose-findorcreate'); //installing this line in the Itmes collection
    /////For Image Uploading//////
    const multer = require("multer");
    const path = require("path");
    //////New date Format////////
    const dateFormat = require("dateformat");
    const now = new Date();
    /////SESSION MIDDLEWARE///////
    ///////////////to pass cookies and sessions into socket.io
    var sessionMiddleware = expressSession({
        resave: false,
        name: "COOKIE_NAME_HERE",
        secret: "COOKIE_SECRET_HERE",
        store: new(require("connect-mongo")(expressSession))({
            url: "mongodb://127.0.0.1:27017/forumn"
        }),
        saveUninitialized: false,
    });
    ////////////////////////////////////
    /////////////////
    const bodyParser = require("body-parser");
    /////////////////
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static("public"));

    const ejs = require("ejs");
    /////////////////
    app.use(sessionMiddleware)
    app.use(session({
        secret: "Our  little secret.",
        resave: false,
        saveUninitialized: false
    }));

    //start initializing passport to manage those sessions
    app.use(passport.initialize());
    app.use(passport.session());
    //mongoose.connect
    mongoose.connect('mongodb://127.0.0.1:27017/forumn', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    mongoose.set("useCreateIndex", true);
    mongoose.set('useFindAndModify', false);
    const Post = require("./models/posts")
    const Item = require("./models/items")
    const Mod = require("./models/moderator")
    const Com = require("./models/com");
    //////////////////////////////////////
    const { functionsIn, update } = require("lodash");
    const { post } = require("./routes/routes");
    const { writer } = require("repl");
    const { exec } = require("child_process");
    const { strict } = require("assert");


    passport.use(Item.createStrategy());

    ///////////////////
    passport.serializeUser(function(user, done) {
        done(null, { id: user._id, email: user.username, name: user.name, image: user.profileimage });
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    //will have to write app.use(passport.initialize before mongoose.connect)

    //////Creating storage engine middleware for Uploading Image/////////
    var Storage = multer.diskStorage({
        destination: "./public/uploads",
        filename: function(req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); //It gets the extension
        }
    });
    var upload = multer({ storage: Storage }).single('file')
    app.use(routes)


    app.get("/", function(req, res) {
        res.render("homesecond");
    });
    app.get("/login", function(req, res) {
        res.render("login");
    });
    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/home",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            Item.findOrCreate({
                googleId: profile.id,
                name: profile.displayName,
                emailid: "",
                username: profile.name.givenName,
                institute: profile.name.familyName,
                googleprofileimage: profile.photos[0].value

            }, function(err, user) {
                return cb(err, user);
            });
        }
    ));
    passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "http://localhost:3000/auth/facebook/home"
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            Item.findOrCreate({ facebookId: profile.id }, function(err, user) {
                return cb(err, user);
            });
        }
    ));
    app.get("/auth/google",
        passport.authenticate("google", { scope: ["profile"] })
    );
    app.get("/auth/google/home",
        passport.authenticate("google", { failureRedirect: "/login" }),
        function(req, res) {
            // Successful authentication, redirect to secrets.
            res.redirect("/home");
        });
    app.get("/auth/facebook",
        passport.authenticate("facebook", { scope: ["profile"] }));

    app.get("/auth/facebook/home",
        passport.authenticate("facebook", { failureRedirect: "/login" }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect("/home");
        });
    app.get("/registering", function(req, res) {
        res.render("registering");
    })
    app.post("/registering", function(req, res) {
        Item.register({ username: req.body.username, name: req.body.name }, req.body.password, function(err, user) {

            if (err) {
                console.log(err);
                res.redirect("/registering");
            } else { //means if already registered
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/login");
                });
            }
        });

    });
    app.post("/like/:id", function(req, res) {
        Post.findOne({
            _id: req.params.id,
            like: { $in: req.user.id } //If the current user is somehow exists in the like Object array
        }).exec(function(err, loop) {

            if (loop !== null) {
                console.log("You already LIked");
                res.json({ "status": "error", "message": "You Have already Liked" })
            } else {
                Post.update({ _id: req.params.id }, {
                        $addToSet: { like: req.user.id },
                        $pull: { dislike: req.user.id }
                    }).exec(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.redirect("/");
                        }
                    }),
                    function(req, res) {
                        res.json({ "Msg": "Liked" })
                    }
            }
        });
    });


    app.post("/login", function(req, res) {
        const item = new Item({
            username: req.body.username,
            password: req.body.password,
        })
        req.login(item, function(err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/home");
                });
            }
        });
    });
  app.post("/compose/:itemsId", upload, function(req, res) {
        if (req.isAuthenticated()) {
            if (!req.file) {
                const post = new Post({
                    topic: req.body.postTopic,
                    title: req.body.postTitle,
                    content: req.body.postarticle,
                    author: req.params.itemsId,
                    Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")

                });
                post.save(function(err) {
                    if (!err) {
                        res.redirect("/articles");
                    }
                });
            } else if (req.file) {
                const post = new Post({
                    topic: req.body.postTopic,
                    title: req.body.postTitle,
                    content: req.body.postarticle,
                    author: req.params.itemsId,
                    Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
                    postimage: req.file.filename
                });
                post.save(function(err) {
                    if (!err) {
                        res.redirect("/articles");
                    }
                });
            }
        } else {
            res.redirect("/login");
        }
    });
    app.post("/uploadposts/:itemsId", function(req, res) {

    })

    app.get("/posts/:postId", function(req, res) {
        const requestedPostId = req.params.postId;
        Post.find({ _id: requestedPostId }).populate({
            path: 'comments',
            populate: {
                path: 'username',
            }
        }).populate({
            path: "author"
        }).exec(function(err, posts) {
            res.render("post", {
                posts: posts,
                name: req.user.name
            });
        });
    });

    app.get("/home", function(req, res) {
        if (req.isAuthenticated()) {
            //finding from two collections //copy paste and remove all the err,if-else and seperate both the collections if getting confused
            Post.find({}).populate("author").populate("comment").exec(function(err, posts) { //to read from the database
                if (err) {
                    console.log(err);
                } else {
                    Com.find({}).populate({
                        path: "communityposts",
                        populate: {
                            path: "writer",
                        }
                    }).exec(function(err, allpost) {
                        if (err) {
                            console.log(err);
                        } else {
                            Com.find({}).limit(5).populate({
                                path: "communityposts",
                                populate: {
                                    path: "writer",
                                }
                            }).exec(function(err, posts2) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    Com.find({}).sort({ communitytotalrankpoints: -1 }).limit(5).populate({
                                        path: "communityposts",
                                        populate: {
                                            path: "writer",
                                        }
                                    }).exec(function(err, toberanked) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            Com.find({}).sort({ communitytotalrankpoints: -1 }).populate({
                                                path: "communityposts",
                                                populate: {
                                                    path: "writer",
                                                }
                                            }).exec(function(err, toberankedparticular) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    Item.find({ _id: req.user.id }).exec(function(err, items) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            res.render("home", {
                                                                allpost: allpost,
                                                                items: items,
                                                                posts: posts,
                                                                posts2: posts2,
                                                                toberanked: toberanked,
                                                                toberankedparticular: toberankedparticular,
                                                                user: req.user.id,
                                                                name: req.user.name
                                                            });
                                                        }
                                                    });
                                                }
                                            })


                                        }
                                    });
                                }

                            });
                        }
                    });

                }


            });
        } else {
            res.redirect("/login");
        }
    });
    app.get("/articles", function(req, res) {
        if (req.isAuthenticated()) {
            //finding from two collections //copy paste and remove all the err,if-else and seperate both the collections if getting confused
            Post.find({}).populate("author").populate("comment").exec(function(err, posts) { //to read from the database
                if (err) {
                    console.log(err);
                } else {
                    Item.find({ _id: req.user.id }).exec(function(err, items) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render("articles", {
                                items: items,
                                posts: posts,
                                user: req.user.id,
                                name: req.user.name
                            });
                        }
                    });
                }
            });


        } else {
            res.redirect("/login");
        }
    });

    app.get("/compose", function(req, res) {
        res.render("compose", {
            items: req.user.id
        });
    });

    app.get("/MyAccount", function(req, res) {
        res.render("MyAccount")
    });


    app.post("/MyAccount", upload, function(req, res) {
        if (req.file) {
            Item.update({ _id: req.user.id }, {
                profileimage: req.file.filename,
                fullname: req.body.fullname,
                cityname: req.body.cityname,
                academics: req.body.academics,
                institute: req.body.institute,
                phonenumber: req.body.phonenumber,
                emailid: req.body.emailid,
                address: req.body.address,
                pincode: req.body.pincode,
                user: req.user.id,
                Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
            }).exec(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Updated Profile");
                    res.redirect("/home");
                }
            });
        } else if (!req.file) {
            Item.update({ _id: req.user.id }, {
                fullname: req.body.fullname,
                cityname: req.body.cityname,
                academics: req.body.academics,
                institute: req.body.institute,
                phonenumber: req.body.phonenumber,
                emailid: req.body.emailid,
                address: req.body.address,
                pincode: req.body.pincode,
                user: req.user.id,
                Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
            }).exec(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully Updated Profile");
                    res.redirect("/home");
                }
            });
        }

    });


    app.get("/about", function(req, res) {
        res.render("about");
    });


    app.get("/contact", function(req, res) {
        res.render("contact");
    });

    app.post("/delete", function(req, res) {
        const id = req.body.checkbox;
        Post.findByIdAndRemove(id, function(err) {
            if (!err) {
                console.log("Successfully deleted checked item.");
                res.redirect("home");
            }
        });
    });
    app.get("/chat", function(req, res) {
        //This is Amazing, we have successfuly populated the array
        Post.find({}).populate({
            path: 'chat',
            populate: {
                path: 'author',
            }
        }).exec(function(err, loop) {
            res.render("chat", { msg: loop })
        });
    });

    app.post("/unlike", function(req, res) {
        const postId = req.body.unvote;
        const userId = req.user.id;
        Post.update({ _id: postId }, {
            $pull: {
                like: userId,
                dislike: userId
            }
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/posts/" + postId);
            }
        });
    });


    app.post("/discussion/:postId", function(req, res) {
        const postId = req.params.postId;
        const name = req.user.id;
        console.log(req.body.input);
        console.log(postId);
        Post.update({ _id: postId }, {
            $push: {
                comments: {
                    username: name,
                    message: req.body.input,
                    Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
                }
            },
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log(req.user.id);
                res.redirect("/")
            }
        });
    });
    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/login");

    });
    app.post("/topics", upload, function(req, res) {
        const userId = req.user.id;
        Com.findOne({
            "subject": req.body.com
        }).exec(function(err, loop) {
            if (loop !== null) {
                res.json("Community With this name already exist")
                console.log("Community with same name alreay exist");
            } else {
                if (req.file) {
                    const com = new Com({
                        creator: userId,
                        subject: req.body.com,
                        description: req.body.textarea,
                        category: req.body.same,
                        customCategory: req.body.createtype,
                        comimage: req.file.filename,
                        Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
                        communitytotalrankpoints: 0,
                        newId: mongoose.Types.ObjectId
                    });
                    com.save(function(err) {
                        if (err) {

                            console.log(err);
                        } else {
                            console.log("success");
                            res.redirect("/home")
                        }
                    });
                } else if (!req.file) {
                    const com = new Com({
                        creator: userId,
                        subject: req.body.com,
                        description: req.body.textarea,
                        category: req.body.same,
                        customCategory: req.body.createtype,
                        Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
                    })
                    com.save(function(err) {
                        if (err) {

                            console.log(err);
                        } else {
                            console.log("success");
                            res.redirect("/home")
                        }
                    })
                }
            }
        });
    });
    ////experimenting////
    //sort({ communitytotalrankpoints: -1 }).
    //.limit(5)=only top 5 collections will be shown
    //communitytotalrankpoints:-1 =to sort the collections based on communitytotalrankpoints in descendnig order
    app.get("/exp", function(req, res) {
        Com.find({}).sort({ communitytotalrankpoints: -1 }).limit(5).exec(function(err, loop) {
            res.render("zexperiment", {
                loop: loop
            });
        });
    });
    ///---********---///

    app.post("/communities/:comId", upload, function(req, res) {
        const reportId = Math.random() * 10000000000000000;
        const CommId = req.params.comId;
        const postcontent = req.body.postarticle;
        const postTitle = req.body.postTitle;
        const UserId = req.user.id;
        if (req.file) {
            Com.update({ _id: CommId }, {
                $push: {
                    communityposts: {
                        postcontent: postcontent,
                        title: postTitle,
                        writer: UserId,
                        Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
                        communitypostsimage: req.file.filename,
                        reportId: reportId
                    }
                },

            }).exec(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully");
                    res.redirect("/home");
                }
            });
        } else if (!req.file) {
            Com.update({ _id: CommId }, {
                $push: {
                    communityposts: {
                        postcontent: postcontent,
                        title: postTitle,
                        writer: UserId,
                        Date: dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"),
                        reportId: reportId
                    }
                }
            }).exec(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully");
                    res.redirect("/home");
                }
            });
        }
    });
    app.get("/communities/:comId", function(req, res) {
        const userId = req.user.id;
        console.log(userId);
        Com.find({
            _id: req.params.comId,
            members: { $in: req.user.id }
        }).populate("members").exec(function(err, loop) {
            if (loop == null) {
                res.json({ "error": "The user doesn't exist in the community, So please connect First" });
            } else {
                console.log(loop);
                res.render("communities", {
                    posts: loop,
                    userId: userId
                });
            }
        });
    });
    app.get("/composts/:comId/:compostsssId", function(req, res) {
        console.log(new Date(Date.now()).toISOString());
        const comId = req.params.comId;
        const compostsssId = req.params.compostsssId;
        const userId = req.user.id;
        Com.find({ "communityposts._id": compostsssId }).populate({
            path: "communityposts",
            populate: {
                path: "writer"
            },
        }).populate({
            path: "communityposts",
            populate: {
                path: "comcomments",
                populate: {
                    path: "username",
                }
            }
        }).populate({
            path: "communityposts",
            populate: {
                path: "comcomments.comcommentreplies",
                populate: {
                    path: "replyuser",

                }
            }
        }).populate({
            path: "communityposts",
            populate: {
                path: "comcomments.comcommentreplies.replylayer2",
                populate: {
                    path: "replylayer2user",

                }
            }
        }).populate({
            path: "communityposts",
            populate: {
                path: "comcomments.comcommentreplies.replylayer2.replylayer3",
                populate: {
                    path: "replylayer3user",

                }
            }
        }).populate({
            path: "communityposts",
            populate: {
                path: "comcomments.comcommentreplies.replylayer2.replylayer3.replylayer4",
                populate: {
                    path: "replylayer4user",

                }
            }
        }).populate({
            path: "comments",
            populate: {
                path: "username"
            }
        }).exec(function(err, composts) {
            console.log(compostsssId)
            console.log(composts)
            res.render("composts", {
                composts: composts,
                compostId: compostsssId,
                userId: userId,
                name: req.user.name
            });
        });

    });
    app.post("/comlike/:comId/:postId", function(req, res) {
        //var countpoint;
        //console.log(countpoint);
        const compostId = req.body.upvote;
        const comId = req.params.comId;
        console.log(req.params.postId);
        const userId = req.user.id;
        Com.findOne({
            _id: req.params.comId,
            "communityposts": {
                "$elemMatch": {
                    _id: req.params.postId,
                    "like": {
                        "$elemMatch": {
                            $in: req.user.id
                        }
                    }
                }
            }
        }).exec(function(err, loop) {
            if (loop !== null) {
                console.log("You Have Already Liked");
                res.json({ "status": "error", "message": "You Have already Liked the post" })
            } else {
                Com.update({ _id: comId, "communityposts._id": req.params.postId }, {
                    $addToSet: {
                        "communityposts.$.like": userId
                    },
                    $pull: {
                        "communityposts.$.dislike": userId
                    },
                }).exec(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        Com.update({ _id: comId }, {
                            $inc: { communitytotalrankpoints: 1 }
                        }).exec(function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("Successfully Inserted");
                            }
                        })
                        console.log("com like added successfully");
                        res.redirect("/home");
                    }
                });
            }
        });
    });


    app.post("/comunlike/:comId", function(req, res) {
        const compostId = req.body.unvote;
        const comId = req.params.comId;
        const userId = req.user.id;
        Com.update({ _id: comId, "communityposts._id": compostId }, {
            $pull: {
                "communityposts.$.like": userId,
                "communityposts.$.dislike": userId,
            }
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                Com.update({ _id: comId }, {
                    $inc: { communitytotalrankpoints: -1 }
                }).exec(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("decremented total community rank points");
                    }
                })
                res.redirect("/composts/" + comId + "/" + compostId);
            }
        });
    });

    app.post("/comdiscussion/:comId", function(req, res) {
        const comId = req.params.comId
        const name = req.user.id
        const msg = req.body.message
        Com.update({ _id: comId }, {
            $push: {
                comments: {
                    username: name,
                    message: msg
                }
            },
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log(req.body.message);
                console.log(req.user.id);
                res.redirect("/home");
            }
        });
    });
    app.post("/composts/:comId/:compostId", function(req, res) {
        const comId = req.params.comId;
        const compostId = req.params.compostId;
        const msg = req.body.input;
        const name = req.user.id;
        Com.update({ _id: comId, "communityposts._id": compostId }, {
            $push: {
                "communityposts.$.comcomments": {
                    username: name,
                    message: msg
                }
            }
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log(req.body.input);
                console.log(req.user.id);
                res.redirect("/composts/" + comId + "/" + compostId)
            }
        });
    });
    app.get("/composts/reply/:comId/:compostId", function(req, res) {
        // console.log("");
        console.log(req.params.comId + "SuccessFull" + req.params.compostId);
        res.render("reply");
    });
    app.post("/replycomposts/:comId/:compostId/:comcommentsId", function(req, res) {
        console.log(req.params.comcommentsId);
        const comId = req.params.comId;
        const compostId = req.params.compostId;
        const comcommentsId = req.params.comcommentsId;
        const msg = req.body.reply;
        const name = req.user.id;
        console.log(msg);
        console.log(name);
        Com.update({ _id: comId }, {
            $push: {
                "communityposts.$[].comcomments.$[reply].comcommentreplies": {
                    replyuser: name,
                    replymessage: msg
                },
            }
        }, {
            arrayFilters: [{ 'reply._id': comcommentsId }]
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted");
                res.redirect("/composts/" + comId + "/" + compostId)
            }
        });
    });
    app.post("/replycomposts/:comId/:compostId/:comcommentsId/:replylayer1commentId", function(req, res) {
        console.log(req.params.comcommentsId);
        const comId = req.params.comId;
        const compostId = req.params.compostId;
        const comcommentsId = req.params.comcommentsId;
        const layer2Id = req.params.replylayer1commentId;
        const name = req.user.id;
        const layer2reply = req.body.replylayer1;
        console.log(req.body.replylayer1);
        Com.update({ _id: comId }, {
            $push: {
                "communityposts.$[].comcomments.$[reply].comcommentreplies.$[layer2].replylayer2": {
                    replylayer2user: name,
                    replylayer2message: layer2reply
                },
            }
        }, {
            arrayFilters: [{ 'reply._id': comcommentsId }, { 'layer2._id': layer2Id }]
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted");
                res.redirect("/composts/" + comId + "/" + compostId)
            }
        });
    });
    app.post("/replycomposts/:comId/:compostId/:comcommentsId/:replylayer1commentId/:replylayer2commentId", function(req, res) {
        console.log(req.params.comcommentsId);
        const comId = req.params.comId;
        const compostId = req.params.compostId;
        const comcommentsId = req.params.comcommentsId;
        const layer2Id = req.params.replylayer1commentId;
        const layer3Id = req.params.replylayer2commentId;
        const name = req.user.id;
        const layer3reply = req.body.replylayer2;
        console.log(layer3reply, "fgdfgdfgdfgdf");
        Com.update({ _id: comId }, {
            $push: {
                "communityposts.$[].comcomments.$[reply].comcommentreplies.$[layer2].replylayer2.$[layer3].replylayer3": {
                    replylayer3user: name,
                    replylayer3message: layer3reply
                },
            }
        }, {
            arrayFilters: [{ 'reply._id': comcommentsId }, { 'layer2._id': layer2Id }, { 'layer3._id': layer3Id }]
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted");
                res.redirect("/composts/" + comId + "/" + compostId)
            }
        });
    });
    app.post("/replycomposts/:comId/:compostId/:comcommentsId/:replylayer1commentId/:replylayer2commentId/:replylayer3commentId", function(req, res) {
        console.log(req.params.comcommentsId);
        const comId = req.params.comId;
        const compostId = req.params.compostId;
        const comcommentsId = req.params.comcommentsId;
        const layer2Id = req.params.replylayer1commentId;
        const layer3Id = req.params.replylayer2commentId;
        const layer4Id = req.params.replylayer3commentId;

        const name = req.user.id;
        const layer4reply = req.body.replylayer3;
        Com.update({ _id: comId }, {
            $push: {
                "communityposts.$[].comcomments.$[reply].comcommentreplies.$[layer2].replylayer2.$[layer3].replylayer3.$[layer4].replylayer4": {
                    replylayer4user: name,
                    replylayer4message: layer4reply
                },
            }
        }, {
            arrayFilters: [{ 'reply._id': comcommentsId }, { 'layer2._id': layer2Id }, { 'layer3._id': layer3Id }, { 'layer4._id': layer4Id }]
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted");
                res.redirect("/composts/" + comId + "/" + compostId)
            }
        });
    });
    app.get("/newforumns", function(req, res) {
        Com.find({}).populate("creator").exec(function(err, loop) {
            res.render("newforumns", {
                Comm: loop,
                user: req.user.id
            });
        });
    })
    app.get("/forumns", function(req, res) {
        const UserId = req.user.id;
        res.render("forumns");

    });
    app.get("/trending", function(req, res) {
        Post.find({}).populate("author").populate("comment").exec(function(err, posts) { //to read from the database
            if (err) {
                console.log(err);
            } else {
                Com.find({}).populate({
                    path: "communityposts",
                    populate: {
                        path: "writer",
                    }
                }).exec(function(err, posts2) {
                    if (err) {
                        console.log(err);
                    } else {
                        Item.find({ _id: req.user.id }).exec(function(err, items) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("trending", {
                                    items: items,
                                    posts: posts,
                                    toberanked: posts2,
                                    user: req.user.id,
                                    name: req.user.name
                                });
                            }
                        });
                    }
                })


            }
        });
    });
    app.get("/blank/:comId", function(req, res) {
        const ComId = req.params.comId
        Com.find({ _id: ComId }).populate({
            path: "communityposts",
            populate: {
                path: "writer",
            }
        }).exec(function(err, comm) {
            if (err) {
                console.log(err);
            } else {
                Item.find({}).exec(function(err, loop) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("blank", {
                            items: loop,
                            comm: comm,
                            comId: req.params.comId,
                            userId: req.user.id
                        });
                    }
                })
            }

        });
    });
    app.get("/users", checkifauth, ifAdmin, function(req, res) {
        Item.find({}).exec(function(err, people) {
            if (err) {
                console.log(err);
            } else {
                Post.find({}).populate("author").exec(function(err, posts) {
                    if (err) {
                        console.log(errr);
                    } else {
                        Com.find({}).populate("creator").exec(function(err, communities) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("users", {
                                    users: people,
                                    posts: posts,
                                    comm: communities
                                });
                            }
                        });
                    }
                });
            }

        });
    });

    function checkifauth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect("/home");
        }
    }

    function checkifmod(req, res, next) {
        console.log(req.user.id);
        Mod.findOne({ "name": req.user.id }).populate("name").exec(function(err, loop) {
            if (loop == null) {
                console.log(err);
                console.log("Moderator not present");
                res.redirect("/home");
            } else {
                if (loop.name._id = req.user.id) {
                    console.log("Moderator present");
                    next();
                } else {
                    console.log("couldn't create moderator");

                }
            }
        });
    };


    function ifAdmin(req, res, next) {
        console.log(req.user.id);
        Item.findById({ _id: req.user.id }, function(err, loop) {
            if (loop._id != "6012d00bb8920566d48672da") {
                res.redirect("/login")
            } else {
                next();
            }
        });
    }
    app.get("/moderator", checkifmod, function(req, res) {
        Item.find({}).exec(function(err, people) {
            if (err) {
                console.log(err);
            } else {
                Post.find({}).populate("author").exec(function(err, posts) {
                    if (err) {
                        console.log(errr);
                    } else {
                        Com.find({}).populate("creator").exec(function(err, communities) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.render("moderator", {
                                    users: people,
                                    posts: posts,
                                    comm: communities
                                });
                            }
                        });
                    }
                });
            }

        });
    });
    app.post("/requestjoin/:comId", function(req, res) {
        const button = req.body.button;
        console.log("Hi" + button);
        const comId = req.params.comId
        console.log("Its a Success");
        Com.findByIdAndUpdate({ _id: comId }, {
            $addToSet: {
                members: req.user.id
            }

        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/communities/" + req.params.comId);
            }
        });
    });
    app.get("/chooseposts", function(req, res) {
        Com.find({ members: req.user.id }).exec(function(err, loop) {
            res.render("chooseposts", {
                Comm: loop,
                user: req.user
            });
        });
    });
    app.get("/forumnbutredirect", function(req, res) {
        const UserId = req.user.id;
        Com.find({}).exec(function(err, loop) {
            res.render("forumnbutredirect", {
                Comm: loop,
                user: req.user.id
            });
        });
    });
    app.post("/report/:comId/:compostId", function(req, res) {
        console.log(req.params.compostId);
        console.log(req.body.choosed);
        console.log(req.body.textarea);
        console.log(req.params.comId);
        Com.update({ _id: req.params.comId, "communityposts._id": req.params.compostId }, {
            $push: {
                "communityposts.$.report": {
                    reporter: req.user.id,
                    reason: req.body.choosed,
                    reportdescription: req.body.textarea
                }

            }

        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/home");
                console.log("success");
            }
        })
    })
    app.post("/removeuser", function(req, res) {
        const val = req.body.value3;
        if (req.body.value2 != "6012d00bb8920566d48672da") {
            if (req.body.value2) {
                Item.findByIdAndDelete({ _id: req.body.value2 }, function(err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Deleted :", docs);
                    }
                })
            }
        }
        const mod = new Mod({
            name: val
        });
        mod.save(function(err) {
            if (!err) {
                console.log("Added the value required");
                res.redirect("/users");
            }
        });
    });
    app.post("/removepost/:comId/:compostId", function(req, res) {
        const item = req.body.posttobedeleted;
        console.log(req.params.comId);
        console.log(req.params.compostId);
        console.log(item);
        Com.update({ _id: req.params.comId }, {
            $pull: { //.$ is not required as it is not any nested array
                communityposts: {
                    _id: item
                }
            }
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/users");
                console.log("Successfully Inserted");
            }
        })

    });

    app.post("/deleteforumn", function(req, res) {
        console.log(req.body.users);
        Com.findByIdAndRemove({ _id: req.body.users }, function(err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/users");
                console.log("Deleted :", docs);
            }
        });
    });
    app.post("/removeposts", function(req, res) {
        Com.update({ _id: req.body.users }, {
            $set: {
                communityposts: []
            }
        }).exec(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/users");
                console.log("Sucssessfully removed the entire elements or posts from the community");
            }
        })
    });
    app.get("/settings", function(req, res) {
        Item.find({}).exec(function(rerr, loop) {
            res.render("settings", {
                loop: loop,
                user: req.user.id
            })
        })
    });

    http.listen(3000, function() {
        console.log("The server connected with port 3000");
    });


    /// Socket
    const io = require("socket.io")(http)
    io.use(function(socket, next) {
        sessionMiddleware(socket.request, {}, next)
    });
    io.on('connection', function(socket) {
        var userId = socket.request.session.passport.user.id;
        console.log("Your User ID is", userId);
        console.log('A user connected');
        socket.on('setUsername', function(data) {
            Post.update({}, {
                //pushing a new element everytime
                $addToSet: {
                    chat: {
                        author: userId,
                        message: data.please
                    }
                },

            }).exec(function(err) {
                if (!err) {
                    console.log("success");
                }
            })
            io.sockets.emit('userSet', data);

        });

    });