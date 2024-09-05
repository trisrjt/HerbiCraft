const mongoose = require("mongoose");

const treeSchema = mongoose.Schema({
    image : Buffer,
    name : String,
    about : String,
    commonNames : {
        type : Array,
        default : []
    },
    regions : {
        type : Array,
        default : []
    },
    uses : {
        type : Array,
        default : []
    },
});

module.exports = mongoose.model("tree", treeSchema);