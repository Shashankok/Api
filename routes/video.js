const express = require("express");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const Router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("../models/Video");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Search Api
Router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).populate("user_id", "channelName logoUrl subscribers subscribedBy");
    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Failed to fetch search results" });
  }
});

// Video Upload API
Router.post("/upload", checkAuth, async (req, res) => {
  try {
    const uploadedVideo = await cloudinary.uploader.upload(
      req.files.video.tempFilePath,
      {
        resource_type: "video",
      }
    );
    const uploadedThumbnail = await cloudinary.uploader.upload(
      req.files.thumbnail.tempFilePath
    );

    const user = req.tokenInformation;

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      user_id: user._id,
      video_url: uploadedVideo.secure_url,
      thumbnail_url: uploadedThumbnail.secure_url,
      videoId: uploadedVideo.public_id,
      thumbnailId: uploadedThumbnail.public_id,
      category: req.body.category,
      tags: req.body.tags.split(","),
      videoDuration: uploadedVideo.duration,
    });

    const newUploadedVideoData = await newVideo.save();

    res.status(200).json({
      newVideo: newUploadedVideoData,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
});

// Update Video API
Router.put("/:videoId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const video = await Video.findById(req.params.videoId);

    if (video.user_id == user._id) {
      if (req.files) {
        // update thumbnail also
        await cloudinary.uploader.destroy(video.thumbnailId);
        const updatedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail.tempFilePath
        );
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          thumbnail_url: updatedThumbnail.secure_url,
          thumbnailId: updatedThumbnail.public_id,
          category: req.body.category,
          tags: req.body.tags.split(","),
        };
        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );
        res.status(200).json({
          updatedVideoDeatails: updatedVideoDetail,
        });
      } else {
        // update text only
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          tags: req.body.tags.split(","),
        };
        const updatedVideoDetail = await Video.findByIdAndUpdate(
          req.params.videoId,
          updatedData,
          { new: true }
        );
        res.status(200).json({
          updatedTextDeatails: updatedVideoDetail,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// Delete Video API
Router.delete("/:videoId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    console.log("params", req.params);
    console.log("...............................");

    const video = await Video.findById(req.params.videoId);
    console.log("user id from token : ", user._id);
    console.log("user id from db : ", video.user_id);

    if (user._id == video.user_id) {
      console.log("id matched");
      const deletedThumbnailId = await cloudinary.uploader.destroy(
        video.thumbnailId
      );
      const deletedVideoId = await cloudinary.uploader.destroy(video.videoId, {
        resource_type: "video",
      });
      const deletedVideoFromDb = await Video.findByIdAndDelete(
        req.params.videoId
      );
      res.status(200).json({
        deletedThumbnailId: deletedThumbnailId,
        deletedVideoId: deletedVideoId,
        deletedVideoFromDb: deletedVideoFromDb,
      });
    } else {
      res.status(500).json({
        error: "Invalid Token",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// Like Video API
Router.put("/like/:videoId", checkAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    const user = req.tokenInformation;

    if (video.dislikedBy.includes(user._id)) {
      video.dislikes -= 1;
      video.dislikedBy = video.dislikedBy.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await video.save();
    }
    if (!video.likedBy.includes(user._id)) {
      video.likes += 1;
      video.likedBy.push(user._id);
      await video.save();
      res.status(200).json({
        likeStatus: "liked",
      });
    } else {
      video.likes -= 1;
      video.likedBy = video.likedBy.filter(
        (id) => id.toString() !== user._id.toString()
      );
      await video.save();
      res.status(200).json({
        likeStatus: "like removed",
      });
    }
  } catch (err) {
    console.log("error check: ", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// Dislike Video API
Router.put("/dislike/:videoId", checkAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    const user = req.tokenInformation;

    if (video.likedBy.includes(user._id)) {
      video.likes -= 1;
      video.likedBy = video.likedBy.filter(
        (id) => id.toString() !== user._id.toString()
      );
      await video.save();
    }

    if (!video.dislikedBy.includes(user._id)) {
      video.dislikes += 1;
      video.dislikedBy.push(user._id);
      await video.save();
      res.status(200).json({
        dislikeStatus: "disliked",
      });
    } else {
      video.dislikes -= 1;
      video.dislikedBy = video.dislikedBy.filter(
        (userId) => userId.toString() !== user._id.toString()
      );
      await video.save();
      res.status(200).json({
        dislikeStatus: "dislike removed",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// Views API
Router.put("/views/:videoId", checkAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    const user = req.tokenInformation;

    if (!video.viewedBy.includes(user._id)) {
      video.views += 1;
      video.viewedBy.push(user._id);
      await video.save();
      res.status(200).json({
        viewStatus: "View Increased",
      });
    } else {
      res.status(200).json({
        viewStatus: "Already viewed",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

//Get Video from videoId
Router.get("/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId).populate(
      "user_id",
      "channelName logoUrl subscribers subscribedBy"
    );
    res.status(200).json({
      video: video,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

//Get all videos for a user
Router.get("/user/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const video = await Video.find({ user_id: userId }).populate(
      "user_id",
      "channelName logoUrl subscribers subscribedBy"
    );

    res.status(200).json({
      videos: video,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// Get all videos api
Router.get("/", async (req, res) => {
  try {
    const video = await Video.find().populate("user_id", "channelName logoUrl");
    console.log(video);
    res.status(200).json({
      videos: video,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = Router;
