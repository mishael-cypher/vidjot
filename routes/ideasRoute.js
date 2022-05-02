const express = require("express");
const router = express.Router();
const Ideas = require("../models/IdeaModel");
const {ensureAuthenticated} = require('../helpers/auth')

// Ideas Index Route
router.get("/", ensureAuthenticated, (req, res) => {
  try {
    Ideas.find({user: req.user.id})
      .sort({ date: "desc" })
      .then((ideas) => {
        res.render("ideas/index", {
          ideas: ideas
        });
      });
  } catch (error) {
    console.log(error.message);
  }
});

// Add Idea form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("ideas/add");
});

// Edit Idea form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Ideas.findOne({
    _id: req.params.id,
  }).then((idea) => {
    if(idea.user != req.user.id){
      req.flash('error_msg', 'Not Authorized')
      res.redirect('/ideas')
    }else{
      res.render("ideas/edit", {
        idea: idea,
      });
    }
  });
});

// Process Form
router.post("/", ensureAuthenticated, (req, res) => {
  try {
    let errors = [];

    if (!req.body.title) {
      errors.push({ text: "Please add a title" });
    }
    if (!req.body.details) {
      errors.push({ text: "Please add some details" });
    }
    if (errors.length > 0) {
      console.log(errors.length);
      res.render("ideas/add", {
        errors: errors,
        title: req.body.title,
        details: req.body.details
        
      });
    } else {
      const newUser = {
        title: req.body.title,
        details: req.body.details,
        user: req.user.id
      };
      new Ideas(newUser)
        .save()
        .then((idea) => {
          req.flash("success_msg", "Video idea added");
          res.redirect("/ideas");
        })
        .catch((err) => console.log(err));
    }
  } catch (error) {
    console.log(error.message);
  }
});

// Edit Form Process
router.put("/:id", ensureAuthenticated, (req, res) => {
  Ideas.findOne({
    _id: req.params.id,
  }).then((idea) => {
    (idea.title = req.body.title), (idea.details = req.body.details);

    idea.save().then((idea) => {
      req.flash("success_msg", "Video idea updated");
      res.redirect("/ideas");
    });
  });
});

// Delete Idea
router.delete("/:id", ensureAuthenticated, (req, res) => {
  Ideas.deleteOne({
    _id: req.params.id,
  }).then(() => {
    req.flash("success_msg", "Video idea removed");
    res.redirect("/ideas");
  });
});

module.exports = router;
