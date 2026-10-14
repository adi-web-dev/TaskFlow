const express = require("express");

const {
    getTaskActivities,
} = require("../controllers/activityController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/tasks/:taskId/activity",
    protect,
    getTaskActivities
);

module.exports = router;