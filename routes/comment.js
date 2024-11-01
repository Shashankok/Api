const express = require("express");
const Router = express.Router();
const Comment = require("../models/Comment");
const checkAuth = require("../middleware/checkAuth");
const mongoose = require("mongoose");

// add new comment api
Router.post("/new-comment/:videoId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const newComment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      commentText: req.body.commentText,
      user_id: user._id,
      video_id: req.params.videoId,
    });
    const newCommentData = await newComment.save();
    res.status(200).json({
      newCommentData: newCommentData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

// get all comments api
Router.get("/:videoId", async (req, res) => {
  try {
    const commentList = await Comment.find({
      video_id: req.params.videoId,
    }).populate("user_id", "channelName logoUrl");

    res.status(200).json({
      commentData: commentList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

// delete comment api
Router.delete("/delete-comment/:commentId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id.toString() === user._id.toString()) {
      const deletedComment = await Comment.findByIdAndDelete(
        req.params.commentId
      );
      res.status(200).json({
        deletedCommentInfo: deletedComment,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

// edit comment api
Router.put("/edit-comment/:commentId", checkAuth, async (req, res) => {
  try {
    const user = req.tokenInformation;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id.toString() === user._id.toString()) {
      comment.commentText = req.body.commentText;
      const editedComment = await comment.save();
      res.status(200).json({
        editedComment: editedComment,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});
module.exports = Router;
