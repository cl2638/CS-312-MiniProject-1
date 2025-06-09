var express = require("express");
var path = require("path");

var routes = require("./routes");

var app = express();

app.set("port", process.env.PORT || 3000 );

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to parse form data from POST requests
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use(routes);

app.listen(app.get("port"), function(){
    console.log("Server started on port " + app.get("port"));
});
