const express = require("express");

const {
    createTask,
    getTasks,
    updateTask,
    assignTask,
    deleteTask,
    getMyTasks,
    updateTaskStatus,
    taskDetails,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create task
router.post(
    "/projects/:projectId/tasks",
    protect,
    createTask
);


// Get tasks
router.get(
    "/projects/:projectId/tasks",
    protect,
    getTasks
);


// Update task
router.put(
    "/tasks/:taskId",
    protect,
    updateTask
);


// Assign task
router.put(
    "/tasks/:taskId/assign",
    protect,
    assignTask
);


// Delete task
router.delete(
    "/tasks/:taskId",
    protect,
    deleteTask
);


router.get(
    "/tasks/:workspaceId/my-tasks",
    protect,
    getMyTasks
);

router.put(
    "/tasks/:taskId/status",
    protect,
    updateTaskStatus
);

router.get(
    "/tasks/:taskId/details",
    protect,
    taskDetails
);

module.exports = router;