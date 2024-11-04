const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary");
require("dotenv").config();
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/signup", async (req, res) => {
  const users = await User.find({ email: req.body.email });
  if (users.length > 0) {
    return res.status(500).json({
      error: "Email already exists",
    });
  }

  try {
    const hashCode = await bcrypt.hash(req.body.password, 10);
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.logo.tempFilePath
    );
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashCode,
      logoUrl: uploadedImage.secure_url,
      logoId: uploadedImage.public_id,
    });

    const user = await newUser.save();

    res.status(200).json({
      newUser: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    const users = await User.find({ email: req.body.email });

    if (users.length <= 0) {
      return res.status(500).json({
        error: "Email not found",
      });
    }

    loginEmail = req.body.email;
    loginPassword = req.body.password;

    const isValid = await bcrypt.compare(loginPassword, users[0].password);

    if (!isValid) {
      return res.status(500).json({
        error: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        _id: users[0]._id,
        channelName: users[0].channelName,
        logoId: users[0].logoId,
      },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: "100d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      _id: users[0]._id,
      channelName: users[0].channelName,
      phone: users[0].phone,
      email: users[0].email,
      logoId: users[0].logoId,
      logoUrl: users[0].logoUrl,
      token: token,
    });
  } catch (err) {
    console.log(err);
  }
});

Router.put("/subscribe/:userId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const requestedUser = await User.findById(req.params.userId);
    const requestingUser = await User.findById(user._id);

    if (requestedUser.subscribedBy.includes(user._id)) {
      return res.status(401).json({
        error: "Already a subscriber",
      });
    } else {
      requestedUser.subscribers += 1;
      requestedUser.subscribedBy.push(user._id);
      await requestedUser.save();
      requestingUser.subscribedChannels.push(req.params.userId);
      await requestingUser.save();
      res.status(200).json({
        message: "Subscribed",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

Router.put("/unsubscribe/:userId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const requestedUser = await User.findById(req.params.userId);
    const requestingUser = await User.findById(user._id);

    if (requestedUser.subscribedBy.includes(user._id)) {
      requestedUser.subscribers -= 1;
      requestedUser.subscribedBy = requestedUser.subscribedBy.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await requestedUser.save();
      requestingUser.subscribedChannels =
        requestingUser.subscribedChannels.filter(
          (userId) => userId.toString() !== req.params.userId.toString()
        );
      await requestingUser.save();
      res.status(200).json({
        subscribedStatus: "Unsubscribed successfully",
      });
    } else {
      return res.status(401).json({
        error: "You are not a subscriber",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});
module.exports = Router;
