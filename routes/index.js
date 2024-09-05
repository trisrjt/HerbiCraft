const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const treeModel = require("../models/tree-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", { error, isLoggedIn: false });
});

router.get("/trees", isLoggedIn, async function (req, res) {
    let trees = await treeModel.find();
    let success = req.flash("success");
    const info = req.flash("info");
    const error = req.flash("error")
    res.render("trees", { trees, success, info, error });
});

router.get('/profile', isLoggedIn, async function(req, res) {

    let user = await userModel.findOne({ email: req.user.email });

    if (user) {
        res.render('profile', { user });
    } else {
        res.redirect('/');
    }
});

router.get("/bookmark", isLoggedIn, async function (req, res) {
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("bookmark");

    res.render("bookmark", { user });
});


router.get("/bookmark/:treeid", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        // Check if the tree ID is already in the bookmark array
        if (!user.bookmark.includes(req.params.treeid)) {
            user.bookmark.push(req.params.treeid);
            await user.save();
            req.flash("success", "Added to bookmark");
        } else {
            req.flash("info", "Already bookmarked");
        }

    } catch (error) {
        req.flash("error", "Something went wrong");
    }

    res.redirect("/trees");
});

router.get("/bookmark/remove/:treeid", isLoggedIn, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        // Check if the tree ID is in the bookmark array
        if (user.bookmark.includes(req.params.treeid)) {
            user.bookmark.pull(req.params.treeid); // Remove the tree ID from the bookmark array
            await user.save();
            // req.flash("success", "Removed from bookmark");
        } else {
            req.flash("info", "Bookmark not found");
        }

    } catch (error) {
        req.flash("error", "Something went wrong");
    }

    res.redirect("/bookmark"); // Redirect to the bookmark page
});


router.get("/search", isLoggedIn, async function (req, res) {
    try {
        // Retrieve all plants initially (or define an empty result set)
        let plants = await treeModel.find();

        res.render("search", { plants });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while fetching plants");
        res.redirect("/");
    }
});

// Route to handle the search and filtering logic
router.post("/search/results", isLoggedIn, async function (req, res) {
    try {
        const { search, region, use } = req.body;

        // Build a query object based on the filters
        let query = {};

        // Search by tree name or common names
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
                { commonNames: { $regex: search, $options: "i" } } // Case-insensitive search by common names
            ];
        }

        // Filter by region (case-insensitive, matching any element in the regions array)
        if (region && region !== "All") {
            query.regions = { $regex: new RegExp(region, "i") }; // Case-insensitive match for any element in the regions array
        }

        // Filter by uses (case-insensitive, matching any element in the uses array)
        if (use && use !== "All") {
            query.uses = { $regex: new RegExp(use, "i") }; // Case-insensitive match for any element in the uses array
        }

        // Find the plants that match the query
        let plants = await treeModel.find(query);

        res.render("search", { plants });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong during the search");
        res.redirect("/search");
    }
});




router.get("/logout", isLoggedIn, function (req, res) {
    res.render("trees");
})

module.exports = router;