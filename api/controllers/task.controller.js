import path from "path";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { ProjectMember } from "../models/projectMember.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── List Tasks ───────────────────────────────────────────────────────────────
export const getProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.project._id })
    .populate("assignedTo", "username email")
    .populate("assignedBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { tasks }, "Tasks fetched successfully"));
});

// ─── Create Task ──────────────────────────────────────────────────────────────
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;

  // Validate assignee is a member of the project
  if (assignedTo) {
    const isMember = await ProjectMember.findOne({
      project: req.project._id,
      user: assignedTo,
    });
    if (!isMember) {
      throw new ApiError(400, "Assigned user is not a member of this project");
    }
  }

  // Handle file attachments
  const attachments = (req.files || []).map((file) => ({
    url: `${process.env.APP_URL}/images/${path.basename(file.path)}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const task = await Task.create({
    title,
    description,
    project: req.project._id,
    assignedTo: assignedTo || null,
    assignedBy: req.user._id,
    status,
    attachments,
  });

  const populated = await task.populate([
    { path: "assignedTo", select: "username email" },
    { path: "assignedBy", select: "username email" },
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(201, { task: populated }, "Task created successfully"),
    );
});

// ─── Get Task ─────────────────────────────────────────────────────────────────
export const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    project: req.project._id,
  })
    .populate("assignedTo", "username email")
    .populate("assignedBy", "username email");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Attach subtasks
  const subtasks = await SubTask.find({ task: task._id }).populate(
    "createdBy",
    "username email",
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { task, subtasks }, "Task fetched successfully"),
    );
});

// ─── Update Task ──────────────────────────────────────────────────────────────
export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  const task = await Task.findOne({
    _id: taskId,
    project: req.project._id,
  });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate new assignee is project member
  if (assignedTo) {
    const isMember = await ProjectMember.findOne({
      project: req.project._id,
      user: assignedTo,
    });
    if (!isMember) {
      throw new ApiError(400, "Assigned user is not a member of this project");
    }
  }

  // Handle new file attachments (append)
  const newAttachments = (req.files || []).map((file) => ({
    url: `${process.env.APP_URL}/images/${path.basename(file.path)}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;
  if (status !== undefined) task.status = status;
  if (newAttachments.length) {
    task.attachments.push(...newAttachments);
  }

  await task.save();

  const updated = await task.populate([
    { path: "assignedTo", select: "username email" },
    { path: "assignedBy", select: "username email" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { task: updated }, "Task updated successfully"));
});

// ─── Delete Task ──────────────────────────────────────────────────────────────
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOneAndDelete({
    _id: taskId,
    project: req.project._id,
  });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Cascade delete subtasks
  await SubTask.deleteMany({ task: taskId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});
