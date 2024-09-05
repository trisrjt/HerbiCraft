const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();

const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const treesRouter = require("./routes/treesRouter");
const indexRouter = require("./routes/index")


const db = require("./config/mongoose-connection");

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            maxAge: 3600000, // 1 hour session expiry
        },
    })
);
app.use(flash());
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/trees", treesRouter);

app.listen(3000);