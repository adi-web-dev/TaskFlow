const { GoogleGenAI } = require("@google/genai");

const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const Activity = require("../models/Activity");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const responseSchema = {
  type: "object",
  properties: {
    workloadSummary: {
      type: "object",
      properties: {
        total: {
          type: "number",
        },
        completed: {
          type: "number",
        },
        inProgress: {
          type: "number",
        },
        todo: {
          type: "number",
        },
        overdue: {
          type: "number",
        },
        highPriorityIncomplete: {
          type: "number",
        },
        completionRate: {
          type: "number",
        },
      },
      required: [
        "total",
        "completed",
        "inProgress",
        "todo",
        "overdue",
        "highPriorityIncomplete",
        "completionRate",
      ],
    },

    attentionNeeded: {
      type: "array",
      items: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
          },
          title: {
            type: "string",
          },
          reason: {
            type: "string",
          },
        },
        required: ["taskId", "title", "reason"],
      },
    },

    focusRecommendation: {
      type: "string",
    },

    productivityTip: {
      type: "string",
    },
  },

  required: [
    "workloadSummary",
    "attentionNeeded",
    "focusRecommendation",
    "productivityTip",
  ],
};

const taskPriorityResponseSchema = {
  type: "object",

  properties: {
    priorities: {
      type: "array",

      items: {
        type: "object",

        properties: {
          taskId: {
            type: "string",
          },

          title: {
            type: "string",
          },

          rank: {
            type: "number",
          },

          priority: {
            type: "string",
          },

          status: {
            type: "string",
          },

          dueDate: {
            type: ["string", "null"],
          },

          reason: {
            type: "string",
          },

          recommendation: {
            type: "string",
          },
        },

        required: [
          "taskId",
          "title",
          "rank",
          "priority",
          "status",
          "dueDate",
          "reason",
          "recommendation",
        ],
      },
    },

    focusTask: {
      type: "string",
    },

    summary: {
      type: "string",
    },
  },

  required: [
    "priorities",
    "focusTask",
    "summary",
  ],
};

const employeePerformanceResponseSchema = {
  type: "object",

  properties: {
    overview: {
      type: "string",
    },

    completionInsight: {
      type: "string",
    },

    deadlineInsight: {
      type: "string",
    },

    workPatternInsight: {
      type: "string",
    },

    attentionAreas: {
      type: "array",
      items: {
        type: "string",
      },
    },

    positiveObservations: {
      type: "array",
      items: {
        type: "string",
      },
    },

    recommendations: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "overview",
    "completionInsight",
    "deadlineInsight",
    "workPatternInsight",
    "attentionAreas",
    "positiveObservations",
    "recommendations",
  ],
};

const getProductivityInsights = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId,
    })
      .populate("project", "name")
      .select("title status priority dueDate project createdAt");

    if (tasks.length === 0) {
      return res.status(200).json({
        insights: {
          workloadSummary: {
            total: 0,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
            highPriorityIncomplete: 0,
            completionRate: 0,
          },
          attentionNeeded: [],
          focusRecommendation:
            "You don't have any assigned tasks yet. Start by creating or accepting a task.",
          productivityTip:
            "Keep your tasks organized by priority and due date.",
        },
      });
    }

    const now = new Date();

    // -----------------------------
    // Calculate workload metrics
    // -----------------------------

    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const todo = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "done"
    ).length;

    const highPriorityIncomplete = tasks.filter(
      (task) =>
        task.priority === "high" &&
        task.status !== "done"
    ).length;

    const completionRate =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    // -----------------------------
    // Prepare task data for Gemini
    // -----------------------------

    const taskData = tasks.map((task) => ({
      taskId: task._id.toString(),
      title: task.title,
      project: task.project?.name || "No project",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? task.dueDate.toISOString().split("T")[0]
        : null,
      createdAt: task.createdAt
        ? task.createdAt.toISOString().split("T")[0]
        : null,
    }));

    // -----------------------------
    // AI Prompt
    // -----------------------------

    const prompt = `
You are the productivity assistant for TaskFlow.

Analyze the user's current task workload and provide
practical productivity insights.

CURRENT WORKLOAD:

Total tasks: ${total}
Completed: ${completed}
In progress: ${inProgress}
Todo: ${todo}
Overdue: ${overdue}
High priority incomplete: ${highPriorityIncomplete}
Completion rate: ${completionRate}%

TASK DATA:

${JSON.stringify(taskData, null, 2)}

Rules:

- Use only the provided task data.
- Do not invent tasks or information.
- Do not change the calculated workload numbers.
- Identify important tasks that need attention.
- Give priority to overdue tasks and high-priority incomplete tasks.
- attentionNeeded should contain at most 5 tasks.
- Give one clear focus recommendation.
- Give one practical productivity tip.
- Keep responses concise.
- Do not make assumptions about the user's personal life or abilities.
`;

    let response;

    // -----------------------------
    // Primary Gemini model
    // -----------------------------

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });
    } catch (error) {
      console.log(
        "Primary Gemini model unavailable. Trying fallback..."
      );

      // -----------------------------
      // Fallback Gemini model
      // -----------------------------

      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });
    }

    const insights = JSON.parse(response.text);

    // -----------------------------
    // Return response
    // -----------------------------

    res.status(200).json({
      insights,
    });
  } catch (error) {
    console.error("AI productivity error:", error);

    res.status(500).json({
      message: "Failed to generate productivity insights",
    });
  }
};

const getTaskPriorities = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId,
      status: { $ne: "done" },
    })
      .populate("project", "name")
      .select(
        "title status priority dueDate project createdAt"
      );

    if (tasks.length === 0) {
      return res.status(200).json({
        priorities: [],
        focusTask: "",
        summary:
          "You don't have any incomplete tasks that need prioritization.",
      });
    }

    const now = new Date();

    const taskData = tasks.map((task) => {
      let daysUntilDue = null;
      let overdue = false;

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);

        const difference =
          dueDate.getTime() - now.getTime();

        daysUntilDue = Math.ceil(
          difference / (1000 * 60 * 60 * 24)
        );

        overdue =
          dueDate < now &&
          task.status !== "done";
      }

      return {
        taskId: task._id.toString(),

        title: task.title,

        project:
          task.project?.name || "No project",

        status: task.status,

        priority: task.priority,

        dueDate: task.dueDate
          ? task.dueDate.toISOString().split("T")[0]
          : null,

        daysUntilDue,

        overdue,

        createdAt: task.createdAt
          ? task.createdAt.toISOString().split("T")[0]
          : null,
      };
    });

    const prompt = `
You are the AI task prioritization assistant for TaskFlow.

Your job is to recommend the order in which the user
should work on their incomplete tasks.

TASK DATA:

${JSON.stringify(taskData, null, 2)}

Prioritization guidelines:

1. Overdue tasks should receive strong consideration.
2. High-priority tasks should generally receive higher priority.
3. Tasks with approaching deadlines should receive attention.
4. In-progress tasks may deserve attention when they are
   close to completion or have an important deadline.
5. Do not automatically prioritize every high-priority task
   above an overdue task.
6. Consider multiple factors together.
7. Do not invent task information.
8. Use only the provided task data.
9. Return every incomplete task in the priorities array.
10. Rank tasks from 1 onward, where 1 means work on it first.
11. Keep reasons concise and practical.
12. The focusTask must be the title of the rank 1 task.
13. The summary should briefly explain the overall prioritization.

Return ONLY valid JSON matching the provided response schema.
`;

    let response;

    // Primary model
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: taskPriorityResponseSchema,
        },
      });
    } catch (error) {
      console.log(
        "Primary Gemini model unavailable. Trying fallback..."
      );

      // Fallback model
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: taskPriorityResponseSchema,
        },
      });
    }

    const priorities = JSON.parse(response.text);

    res.status(200).json(priorities);
  } catch (error) {
    console.error(
      "AI task prioritization error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate task priorities",
    });
  }
};

const getEmployeePerformanceInsights = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    // --------------------------------
    // Check workspace
    // --------------------------------

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // --------------------------------
    // Owner only
    // --------------------------------

    if (
      workspace.owner.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "Only the workspace owner can view employee AI insights",
      });
    }

    // --------------------------------
    // Check employee belongs to workspace
    // --------------------------------

    const isMember = workspace.members.some(
      (member) =>
        member.toString() === userId
    );

    const isOwner =
      workspace.owner.toString() === userId;

    if (!isMember && !isOwner) {
      return res.status(404).json({
        message:
          "Employee does not belong to this workspace",
      });
    }

    // --------------------------------
    // Employee
    // --------------------------------

    const employee = await require("../models/User")
      .findById(userId)
      .select("name email");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // --------------------------------
    // Employee tasks
    // --------------------------------

    const tasks = await Task.find({
      workspace: workspaceId,
      assignedTo: userId,
    })
      .select(
        "title status priority dueDate createdAt completedAt"
      )
      .populate("project", "name")
      .lean();

    // --------------------------------
    // Task metrics
    // --------------------------------

    const totalAssigned = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const todo = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const now = new Date();

    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "done"
    ).length;

    const highPriorityCompleted =
      tasks.filter(
        (task) =>
          task.priority === "high" &&
          task.status === "done"
      ).length;

    const highPriorityIncomplete =
      tasks.filter(
        (task) =>
          task.priority === "high" &&
          task.status !== "done"
      ).length;

    const completionRate =
      totalAssigned > 0
        ? Math.round(
          (completed / totalAssigned) * 100
        )
        : 0;

    const overdueRate =
      totalAssigned > 0
        ? Math.round(
          (overdue / totalAssigned) * 100
        )
        : 0;

    const completedWithDates =
      tasks.filter(
        (task) =>
          task.status === "done" &&
          task.completedAt
      );

    let averageCompletionTime = 0;

    if (completedWithDates.length > 0) {
      const totalTime =
        completedWithDates.reduce(
          (total, task) => {
            const created =
              new Date(task.createdAt);

            const completedAt =
              new Date(task.completedAt);

            return (
              total +
              (completedAt.getTime() -
                created.getTime())
            );
          },
          0
        );

      averageCompletionTime = Math.round(
        totalTime /
        completedWithDates.length /
        (1000 * 60 * 60 * 24)
      );
    }

    const completedOnTime = tasks.filter(
      (task) =>
        task.status === "done" &&
        task.dueDate &&
        task.completedAt &&
        new Date(task.completedAt) <=
        new Date(task.dueDate)
    ).length;

    const completedLate = tasks.filter(
      (task) =>
        task.status === "done" &&
        task.dueDate &&
        task.completedAt &&
        new Date(task.completedAt) >
        new Date(task.dueDate)
    ).length;

    const onTimeCompletionRate =
      completed > 0
        ? Math.round(
          (completedOnTime / completed) * 100
        )
        : 0;

    // --------------------------------
    // Activities
    // --------------------------------

    const activities = await Activity.find({
      user: userId,
      task: {
        $in: tasks.map(
          (task) => task._id
        ),
      },
    })
      .select("task type createdAt")
      .lean();

    const activityMetrics = {
      totalActivities: activities.length,

      statusChanges: activities.filter(
        (activity) =>
          activity.type ===
          "status_changed"
      ).length,

      commentsAdded: activities.filter(
        (activity) =>
          activity.type ===
          "comment_added"
      ).length,

      taskUpdates: activities.filter(
        (activity) =>
          activity.type === "updated"
      ).length,

      priorityChanges: activities.filter(
        (activity) =>
          activity.type ===
          "priority_changed"
      ).length,

      dueDateChanges: activities.filter(
        (activity) =>
          activity.type ===
          "due_date_changed"
      ).length,

      assignments: activities.filter(
        (activity) =>
          activity.type === "assigned"
      ).length,
    };

    // --------------------------------
    // AI task data
    // --------------------------------

    const taskData = tasks.map(
      (task) => ({
        title: task.title,

        project:
          task.project?.name ||
          "No project",

        status: task.status,

        priority: task.priority,

        dueDate: task.dueDate
          ? new Date(task.dueDate)
            .toISOString()
            .split("T")[0]
          : null,

        completedAt:
          task.completedAt
            ? new Date(task.completedAt)
              .toISOString()
              .split("T")[0]
            : null,
      })
    );

    // --------------------------------
    // Prompt
    // --------------------------------

    const prompt = `
You are an AI analytics assistant inside TaskFlow.

Analyze the task-management data for one employee.

Employee:
${employee.name}

Performance metrics:

Total assigned: ${totalAssigned}
Completed: ${completed}
In progress: ${inProgress}
Todo: ${todo}
Overdue: ${overdue}
High priority completed: ${highPriorityCompleted}
High priority incomplete: ${highPriorityIncomplete}
Completion rate: ${completionRate}%
Overdue rate: ${overdueRate}%
Average completion time: ${averageCompletionTime} days
Completed on time: ${completedOnTime}
Completed late: ${completedLate}
On-time completion rate: ${onTimeCompletionRate}%

Activity metrics:

${JSON.stringify(
      activityMetrics,
      null,
      2
    )}

Task data:

${JSON.stringify(
      taskData,
      null,
      2
    )}

Rules:

- Use only the provided data.
- Do not invent information.
- Do not assign an overall employee score.
- Do not make assumptions about the employee's character,
  intelligence, health, motivation or personal circumstances.
- Describe task-management patterns only.
- Clearly distinguish measurable facts from interpretations.
- Mention positive observations when supported by the data.
- Mention attention areas only when supported by the data.
- Keep all observations concise and practical.
- Do not treat activity count alone as a measure of productivity.
- Do not compare this employee with other employees.
- Provide practical recommendations based on the task data.

Return ONLY valid JSON matching the response schema.
`;

    // --------------------------------
    // Gemini
    // --------------------------------

    let response;

    try {
      response =
        await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType:
              "application/json",
            responseSchema:
              employeePerformanceResponseSchema,
          },
        });
    } catch (error) {
      console.log(
        "Primary Gemini model unavailable. Trying fallback..."
      );

      response =
        await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType:
              "application/json",
            responseSchema:
              employeePerformanceResponseSchema,
          },
        });
    }

    const insights = JSON.parse(
      response.text
    );

    // --------------------------------
    // Response
    // --------------------------------

    res.status(200).json({
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
      },

      metrics: {
        totalAssigned,
        completed,
        inProgress,
        todo,
        overdue,
        highPriorityCompleted,
        highPriorityIncomplete,
        completionRate,
        overdueRate,
        averageCompletionTime,
        completedOnTime,
        completedLate,
        onTimeCompletionRate,
      },

      activityMetrics,

      insights,
    });
  } catch (error) {
    console.error(
      "Employee performance AI error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate employee performance insights",
    });
  }
};

module.exports = {
  getProductivityInsights,
  getTaskPriorities,
  getEmployeePerformanceInsights,
};