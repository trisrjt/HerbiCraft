const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const treeModel = require("../models/tree-model");
// const isLoggedIn = require("../middlewares/isLoggedIn");

// router.use(isLoggedIn);

router.post("/create", upload.single("image"), async function (req, res) {

    try {

        let { name, about, commonNames, regions, uses } = req.body;

        let tree = await treeModel.create({
            image: req.file.buffer,
            name,
            about,
            commonNames,
            regions,
            uses,
        });

        req.flash("success", "Plant details uploaded successfully.");
        res.redirect("/owners/admin");
        req.flash("success", null);

    } catch (error) {
        res.send(error.message);
    }

});

module.exports = router;