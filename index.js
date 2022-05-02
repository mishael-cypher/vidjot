const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");

const app = express();

// Load routes
const ideasRoute = require("./routes/ideasRoute");
const usersRoute = require("./routes/usersRoute");


// Passport Config
require('./config/passport')(passport)

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Method Override middleware
app.use(methodOverride("_method"));

// Express-Session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash middleware
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null
  next();
});

mongoose
  .connect("mongodb://localhost/vidjot")
  .then(() => console.log("Connected to the database"))
  .catch((error) => console.error(error.message));

// Initiate Handlebars
app.engine(
  "handlebars",
  exphbs.engine({ handlebars: allowInsecurePrototypeAccess(Handlebars) })
);
app.set("view engine", "handlebars");
app.set("views", `${__dirname}/views`);

// Use routes
app.use("/ideas", ideasRoute);
app.use("/users", usersRoute);

// Index Route
app.get("/", (req, res) => {
  res.render("index");
});

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
