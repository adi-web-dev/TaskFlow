const express = require("express");

const {
    createWorkspace,
    joinWorkspace,
    getMyWorkspaces,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    getMembers,
    removeMember,
    getTeamWorkload,
    getMemberDetails,
    getTeamTasks,
    getMemberPerformance,
} = require("../controllers/workspaceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyWorkspaces);
router.post("/", protect, createWorkspace);
router.put("/:id", protect, updateWorkspace);
router.delete("/:id", protect, deleteWorkspace);
router.get("/:id/members", protect, getMembers);
router.post("/:id/members", protect, addMember);
router.delete("/:id/members/:userId", protect, removeMember);
router.get("/:id/team-workload", protect, getTeamWorkload);
router.get("/:id/members/:userId/details", protect, getMemberDetails);
router.get("/:id/team-tasks", protect, getTeamTasks);
router.post("/join", protect, joinWorkspace);
router.get("/:id/members/:userId/performance", protect, getMemberPerformance
);
module.exports = router;