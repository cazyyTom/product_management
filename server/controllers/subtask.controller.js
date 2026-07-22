import { SubTask } from "../models/subtask.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserRolesEnum } from "../config/constants.js";

// ─── Create Subtask ───────────────────────────────────────────────────────────
export const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  const task = await Task.findOne({
    _id: taskId,
    project: req.project._id,
  });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await SubTask.create({
    title,
    task: task._id,
    project: req.project._id,
    createdBy: req.user._id,
  });

  const populated = await subtask.populate("createdBy", "username email");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { subtask: populated },
        "Subtask created successfully",
      ),
    );
});


export const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  const subtask = await SubTask.findOne({
    _id: subTaskId,
    project: req.project._id,
  });
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const isMemberOnly = req.userRole === UserRolesEnum.MEMBER;

  // Members can only update isCompleted
  if (isMemberOnly && title !== undefined) {
    throw new ApiError(403, "Members can only update the completion status");
  }

  if (!isMemberOnly && title !== undefined) subtask.title = title;
  if (isCompleted !== undefined) subtask.isCompleted = isCompleted;

  await subtask.save();

  const updated = await subtask.populate("createdBy", "username email");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subtask: updated },
        "Subtask updated successfully",
      ),
    );
});

// ─── Delete Subtask ───────────────────────────────────────────────────────────
export const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const subtask = await SubTask.findOneAndDelete({
    _id: subTaskId,
    project: req.project._id,
  });
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});
