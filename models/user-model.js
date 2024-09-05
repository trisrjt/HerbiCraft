const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true,
    },
    email: String,
    password: String,
    bookmark: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tree",
    }],
    // picture : String,
});

module.exports = mongoose.model("user", userSchema);