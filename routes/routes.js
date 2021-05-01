const router = require('express').Router();
const Item = require("../models/items");
const Com = require("../models/com");


require("../node")
const express = require("express")
router.get("/webdev", function(req, res) {
    res.render("zwebdev", {
        items: req.user.id
    });
})
router.get("/androiddev", function(req, res) {
    res.render("zandroiddev", {
        items: req.user.id
    });
})
router.get("/cpcoding", function(req, res) {
    res.render("zcpcoding", {
        items: req.user.id
    });
})
router.get("/os", function(req, res) {
    res.render("zos", {
        items: req.user.id
    });
})

router.get("/robotics", function(req, res) {
    res.render("zrobotics", {
        items: req.user.id
    });
})
router.get("/ml", function(req, res) {
    res.render("zml", {
        items: req.user.id
    });
})
router.get("/freelanching", function(req, res) {
    res.render("zfreelanching", {
        items: req.user.id
    });
})
router.get("/life", function(req, res) {
    res.render("zlife", {
        items: req.user.id
    });
})
router.get("/sports", function(req, res) {
    res.render("zsports", {
        items: req.user.id
    });
})

router.get("/tech", function(req, res) {
    res.render("ztech", {
        items: req.user.id
    });
})
router.get("/music", function(req, res) {
    res.render("zmusic", {
        items: req.user.id
    });
})
router.get("/ai", function(req, res) {
    res.render("zai", {
        items: req.user.id
    });
})
router.get("/cplusplus", function(req, res) {
    res.render("zcplusplus", {
        items: req.user.id
    })

})
router.get("/java", function(req, res) {
    res.render("zjava", {
        items: req.user.id
    });
})

router.get("/nodejs", function(req, res) {
    res.render("znodejs", {
        items: req.user.id
    });
})
router.get("/php", function(req, res) {
    res.render("zphp", {
        items: req.user.id
    });
})
router.get("/mern", function(req, res) {
    res.render("zmern", {
        items: req.user.id
    });
})
router.get("/mysql", function(req, res) {
    res.render("zmysql", {
        items: req.user.id
    });
})
router.get("/photography", function(req, res) {
    res.render("zphotography", {
        items: req.user.id
    });
})
router.get("/careerpath", function(req, res) {
    res.render("zcareerpath", {
        items: req.user.id
    });
})
router.get("/generalcontent", function(req, res) {
    Com.find({ category: "GeneralContent" }).exec(function(err, loop) {
        res.render("ygeneralcontent", { loop: loop, user: req.user.id });
    });
});
router.get("/people", function(req, res) {
    Com.find({ category: "People" }).exec(function(err, loop) {
        res.render("ypeople", { loop: loop, user: req.user.id });
    });
});
router.get("/Science", function(req, res) {
    Com.find({ category: "Science" }).exec(function(err, loop) {
        res.render("yscience", { loop: loop, user: req.user.id });
    });
});
router.get("/Technology", function(req, res) {
    Com.find({ category: "Technology" }).exec(function(err, loop) {
        res.render("ytech", { loop: loop, user: req.user.id });
    });
});
router.get("/Coding", function(req, res) {
    Com.find({ category: "Coding" }).exec(function(err, loop) {
        res.render("ycoding", { loop: loop, user: req.user.id });
    });
});
router.get("/Interesting", function(req, res) {
    Com.find({ category: "Interesting" }).exec(function(err, loop) {
        res.render("yinteresting", { loop: loop, user: req.user.id });
    });
});

router.get("/Discussion", function(req, res) {
    Com.find({ category: "Discussion" }).exec(function(err, loop) {
        res.render("ydiscussion", { loop: loop, user: req.user.id });
    });
});
router.get("/games", function(req, res) {
    Com.find({ category: "Games" }).exec(function(err, loop) {
        res.render("ygames", { loop: loop, user: req.user.id });
    });
});
router.get("/sportss", function(req, res) {
    Com.find({ category: "Sports" }).exec(function(err, loop) {
        res.render("ysports", { loop: loop, user: req.user.id });
    });
});
router.get("/questionanswer", function(req, res) {
    Com.find({ category: "q&a" }).exec(function(err, loop) {
        res.render("yq&a", { loop: loop, user: req.user.id });
    });
});
router.get("/stories", function(req, res) {
    Com.find({ category: "Stories" }).exec(function(err, loop) {
        res.render("ystories", { loop: loop, user: req.user.id });
    });
});
router.get("/facts", function(req, res) {
    Com.find({ category: "Facts" }).exec(function(err, loop) {
        res.render("yfacts", { loop: loop, user: req.user.id });
    });
});
router.get("/psychology", function(req, res) {
    Com.find({ category: "Pshychology" }).exec(function(err, loop) {
        res.render("ypsychology", { loop: loop, user: req.user.id });
    });
});
router.get("/philosophy", function(req, res) {
    Com.find({ category: "Philosophy" }).exec(function(err, loop) {
        res.render("yphilosophy", { loop: loop, user: req.user.id });
    });
});
router.get("/buiseness", function(req, res) {
    Com.find({ category: "Buiseness" }).exec(function(err, loop) {
        res.render("ybuiseness", { loop: loop, user: req.user.id });
    });
});
router.get("/nature", function(req, res) {
    Com.find({ category: "Nature" }).exec(function(err, loop) {
        res.render("ynature", { loop: loop, user: req.user.id });
    });
});
router.get("/art", function(req, res) {
    Com.find({ category: "Art" }).exec(function(err, loop) {
        res.render("yart", { loop: loop, user: req.user.id });
    });
});
router.get("/math", function(req, res) {
    Com.find({ category: "Math" }).exec(function(err, loop) {
        res.render("ymath", { loop: loop, user: req.user.id });
    });
});
router.get("/entertainment", function(req, res) {
    Com.find({ category: "Entertainment" }).exec(function(err, loop) {
        res.render("yentertainment", { loop: loop, user: req.user.id });
    });
});
router.get("/music", function(req, res) {
    Com.find({ category: "Music" }).exec(function(err, loop) {
        res.render("ymusic", { loop: loop, user: req.user.id });
    });
});
router.get("/politics", function(req, res) {
    Com.find({ category: "Politics" }).exec(function(err, loop) {
        res.render("ypolitics", { loop: loop, user: req.user.id });
    });
});
router.get("/lifestyle", function(req, res) {
    Com.find({ category: "Lifestyle" }).exec(function(err, loop) {
        res.render("ylifestyle", { loop: loop, user: req.user.id });
    });
});

router.get("/others", function(req, res) {
    Com.find({ category: "Others" }).exec(function(err, loop) {
        res.render("yothers", { loop: loop, user: req.user.id });
    });
});

module.exports = router