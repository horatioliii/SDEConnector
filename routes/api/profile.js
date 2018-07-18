const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const pick = require("lodash/pick");

// Load Validation
const validateProfileInput = require("../../validation/profile");

// Load Profile Model
const Profile = require("../../models/Profile");
// Load User Model
const User = require("../../models/User");

// @route GET api/profile
// @desc Get current users profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route POST api/profile
// @desc Create or edit current users profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Get fields
    let profileFields = {};

    profileFields = pick(req.body, [
      "handle",
      "company",
      "website",
      "location",
      "status",
      "bio",
      "githubusername"
    ]);

    profileFields.user = req.user.id;
    console.log(profileFields);

    profileFields.social = pick(req.body, [
      "youtube",
      "twitter",
      "facebook",
      "linkedin",
      "instagram"
    ]);

    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Check if handle exists
    Profile.findOne({ handle: profileFields.handle }).then(profile => {
      if (profile && profile.user != req.user.id) {
        errors.handle = "Handle already exists";
        return res.status(400).json(errors);
      } else {
        Profile.findOne({ user: req.user.id }).then(profile => {
          if (profile) {
            // Update current profile
            Profile.findOneAndUpdate(
              { user: req.user.id },
              { $set: profileFields },
              { new: true }
            ).then(profile => res.json(profile));
          } else {
            // Create profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile))
              .catch(err => res.json(err));
          }
        });
      }
    });
  }
);

module.exports = router;
