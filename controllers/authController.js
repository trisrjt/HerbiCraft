const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");


module.exports.registerUser = async function (req, res) {

    try {
        let { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        let user = await userModel.findOne({ email : email });
        if(user) return res.status(401).send("You already have an account. Please login.");

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) return res.send(err.message);
                else {
                    let user = await userModel.create({
                        email,
                        password : hash,
                        fullname,
                    });
                    let token = generateToken(user);
                    res.cookie("token", token);
                }
                res.redirect("/");
            });
        });

        
    } catch (err) {
        res.send(err.message);
    }
}

module.exports.loginUser = async function (req, res) {
    const { email, password } = req.body;

    // Find the user by email
    let user = await userModel.findOne({ email: email });

    if (!user) return res.send("Email or password incorrect!");

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            // Generate a JWT token with an expiration time
            const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: "1h" });

            // Set the token as an HTTP-only cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
                sameSite: "strict", // Prevent CSRF attacks
            });

            // Redirect to a protected route
            res.redirect("/trees");
        } else {
            return res.send("Email or password incorrect");
        }
    });
};

module.exports.logout = async function (req, res) {
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
  };
  