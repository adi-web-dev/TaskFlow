const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getProductivityInsights,
  getTaskPriorities,
  getEmployeePerformanceInsights,
} = require("../controllers/aiController");

router.get("/productivity", protect, getProductivityInsights);

router.get(
  "/task-priorities",
  protect,
  getTaskPriorities
);

router.get(
  "/workspaces/:workspaceId/members/:userId/performance",
  protect,
  getEmployeePerformanceInsights
);

module.exports = router;