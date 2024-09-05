const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const ownerLoggedIn = require("../middlewares/ownerLoggedIn")

// if (process.env.NODE_ENV === "development") {

router.post("/create", async function (req, res) {

    let owners = await ownerModel.find();
    // if(owners.length > 0){ 
    //     return res
    //     .status(503)
    //     .send("You don't have permission to create a new owner");
    // }

    try {
        let { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        let owner = await ownerModel.findOne({ email: email });
        if (owner) return res.status(401).send("You already have an account. Please login.");

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);
                else {
                    let owner = await ownerModel.create({
                        email,
                        password: hash,
                        fullname,
                    });
                    let token = generateToken(owner);
                    res.cookie("token", token);
                }
                // res.redirect("/");
            });
        });
    } catch (err) {
        res.send(err.message);
    }
});
// }

router.get("/", function (req, res) {
    res.render("ownerlogin");
})

router.post("/login", async function (req, res) {
    const { email, password } = req.body;

    let owner = await ownerModel.findOne({ email: email });

    if (!owner) return res.send("Email incorrect!");

    // Compare the provided password with the stored hash
    if (password === "shibam77") {  // Replace "shibam77" with the actual password you want to compare
        // Generate a JWT token with an expiration time
        const token = jwt.sign({ email: owner.email }, process.env.JWT_KEY, { expiresIn: "1h" });

        // Set the token as an HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
            sameSite: "strict", // Prevent CSRF attacks
        });

        // Redirect to a protected route
        res.redirect("/owners/admin");
    } else {
        return res.send("Password incorrect");
    }
});

router.get("/logout", async function (req, res) {
    try {
      res.clearCookie("token"); // Ensure this matches the cookie name used in login
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send("Logout failed");
        }
        res.redirect("/"); // Redirect to the homepage after logout
      });
    } catch (error) {
      res.status(500).send(error);
    }
  });

router.get("/admin", ownerLoggedIn, function (req, res) {

    let success = req.flash("success");
    res.render("createTrees", { success });
});


module.exports = router;