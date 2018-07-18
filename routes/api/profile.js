const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const pick = require("lodash/pick");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

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
              .catch(err => res.status(400).json(err));
          }
        });
      }
    });
  }
);

// @route POST api/profile/experience
// @desc Add experience to profile
// @access Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add to experience array
        profile.experience.unshift(newExp);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route POST api/profile/education
// @desc Add education to profile
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add to experience array
        profile.education.unshift(newEdu);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience to profile
// @access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of the array
        if (removeIndex > -1) {
          profile.experience.splice(removeIndex, 1);
        }

        // Save
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route DELETE api/profile/education/:edu_id
// @desc Delete education to profile
// @access Private
router.delete(
  "/education/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of the array
        profile.education.splice(removeIndex, 1);

        // Save
        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route DELETE api/profile
// @desc delete user and profile
// @access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => User.findOneAndRemove({ _id: req.user.id }))
      .then(() => res.json({ success: true }))
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
