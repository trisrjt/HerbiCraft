const mongoose = require("mongoose");
const config = require("config");

const dbgr = require("debug")("development:mongoose");

mongoose
.connect(`mongodb+srv://shibampandit31:shibam77@herbal.7jryn.mongodb.net/?retryWrites=true&w=majority&appName=Herbal/herbal`)
.then(function(){
    dbgr("connected");
})
.catch(function(err){
    dbgr(err);
})

module.exports = mongoose.connection;