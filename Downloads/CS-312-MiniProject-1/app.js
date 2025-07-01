// sets up the main express app and session handling

// load env vars
require("dotenv").config();

// calling express and express session
const express = require("express");
const path = require("path");
const session = require("express-session");
const routes = require("./routes");

// setting port
const app = express();
app.set("port", process.env.PORT || 4000);

// setup ejs views folder and engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// handle form data submitted by posts
app.use(express.urlencoded({ extended: true }));

// setup sessions to track users - support from session
app.use(session({
  secret: "your_secret_key_here",
  resave: false,
  saveUninitialized: false,
}));

// use route.js for routes
app.use(routes);

// start server
app.listen(app.get("port"), () => {
  console.log("server started on port " + app.get("port"));
});
