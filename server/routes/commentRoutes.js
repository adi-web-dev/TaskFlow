const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getTaskComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

router.get(
  "/tasks/:taskId/comments",
  protect,
  getTaskComments
);

router.post(
  "/tasks/:taskId/comments",
  protect,
  createComment
);

router.delete(
  "/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;