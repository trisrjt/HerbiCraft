// const jwt = require("jsonwebtoken");
// const userModel = require("../models/user-model");

// module.exports = async function (req, res, next) {
//     if(!req.cookies.token) {
//         req.flash("error", "you need to login first");
//         return res.redirect("/");
//     }

//     try {
//         let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
//         let user = await userModel
//             .findOne({ email : decoded.email })
//             .select("-password");

//         req.user = user;
        
//         next();
//     }catch(err){
//         req.flash("error", "something went wrong");
//         res.redirect("/");
//     }
// };

const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async function (req, res, next) {
  // Check if the token exists in cookies
  if (!req.cookies.token) {
    req.flash("error", "You need to log in first");
    return res.redirect("/");
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    // Find the user by email, excluding the password field
    const user = await userModel
      .findOne({ email: decoded.email })
      .select("-password");

    // If user is not found, handle the error
    if (!user) {
      req.flash("error", "User not found, please log in again");
      return res.redirect("/");
    }

    // Attach the user to the request object
    req.token = req.cookies.token;
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle specific JWT errors, such as token expiration or invalid token
    if (err.name === "TokenExpiredError") {
      req.flash("error", "Session expired, please log in again");
    } else if (err.name === "JsonWebTokenError") {
      req.flash("error", "Invalid token, please log in again");
    } else {
      req.flash("error", "Something went wrong, please try again");
    }

    // Redirect to the login page
    res.redirect("/");
  }
};
