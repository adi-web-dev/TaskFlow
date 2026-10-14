const express = require("express");

const {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/workspaces/:workspaceId/projects",
    protect,
    createProject
);

router.get(
    "/workspaces/:workspaceId/projects",
    protect,
    getProjects
);

router.put(
    "/projects/:projectId",
    protect,
    updateProject
);

router.delete(
    "/projects/:projectId",
    protect,
    deleteProject
);

module.exports = router;