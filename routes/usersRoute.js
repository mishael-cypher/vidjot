const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

// Load User Model
const User = require("../models/UserModel");

// User Login Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// User Login Route
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Login Form POST
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// User Register form POST
router.post("/register", (req, res) => {
  try {
    let errors = [];

    if (req.body.password != req.body.password2) {
      errors.push({ text: "Passwords do not match" });
    }
    if (req.body.password.length < 4) {
      errors.push({ text: "Passwords must be at least 4 characters" });
    }
    if (errors.length > 0) {
      console.log(errors);
      res.render("users/register", {
        errors: errors,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
      });
    } else {
      User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
          req.flash("error_msg", "Email already registered");
          res.redirect("/users/register");
        } else {
          const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          };

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              new User(newUser)
                .save()
                .then((user) => {
                  req.flash(
                    "success_msg",
                    "You are now registered and can log in"
                  );
                  res.redirect("/users/login");
                })
                .catch((error) => {
                  console.log(error);
                });
            });
          });
        }
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// Logout User
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/users/login')
})

module.exports = router;
