import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectMember.model.js";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { Note } from "../models/note.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserRolesEnum } from "../config/constants.js";

// ─── List Projects ────────────────────────────────────────────────────────────
export const getUserProjects = asyncHandler(async (req, res) => {
  // Find all memberships for the current user
  const memberships = await ProjectMember.find({ user: req.user._id }).select(
    "project role",
  );

  const projectIds = memberships.map((m) => m.project);

  // Aggregate member count alongside project data
  const projects = await Project.aggregate([
    { $match: { _id: { $in: projectIds } } },
    {
      $lookup: {
        from: "projectmembers",
        localField: "_id",
        foreignField: "project",
        as: "members",
      },
    },
    {
      $addFields: {
        memberCount: { $size: "$members" },
        // Attach the current user's role
        myRole: {
          $let: {
            vars: {
              mem: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$members",
                      as: "m",
                      cond: { $eq: ["$$m.user", req.user._id] },
                    },
                  },
                  0,
                ],
              },
            },
            in: "$$mem.role",
          },
        },
      },
    },
    { $project: { members: 0 } },
    { $sort: { createdAt: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { projects }, "Projects fetched successfully"));
});

// ─── Create Project ───────────────────────────────────────────────────────────
export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
  });

  // Creator becomes the admin of the project
  await ProjectMember.create({
    project: project._id,
    user: req.user._id,
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { project }, "Project created successfully"));
});

// ─── Get Project ──────────────────────────────────────────────────────────────
export const getProjectById = asyncHandler(async (req, res) => {
  // req.project is attached by getProjectRole middleware
  const project = await Project.findById(req.project._id).populate(
    "createdBy",
    "username email",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project fetched successfully"));
});

// ─── Update Project ───────────────────────────────────────────────────────────
export const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.project._id,
    { $set: { name, description } },
    { new: true, runValidators: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project updated successfully"));
});

// ─── Delete Project ───────────────────────────────────────────────────────────
export const deleteProject = asyncHandler(async (req, res) => {
  const projectId = req.project._id;

  // Cascade delete all related documents
  await Task.deleteMany({ project: projectId });
  await SubTask.deleteMany({ project: projectId });
  await Note.deleteMany({ project: projectId });
  await ProjectMember.deleteMany({ project: projectId });
  await Project.findByIdAndDelete(projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

// ─── List Members ─────────────────────────────────────────────────────────────
export const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await ProjectMember.find({
    project: req.project._id,
  }).populate("user", "username email isEmailVerified createdAt");

  return res
    .status(200)
    .json(new ApiResponse(200, { members }, "Members fetched successfully"));
});

// ─── Add Member ───────────────────────────────────────────────────────────────
export const addProjectMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new ApiError(404, "No user found with that email address");
  }

  const existingMembership = await ProjectMember.findOne({
    project: req.project._id,
    user: userToAdd._id,
  });
  if (existingMembership) {
    throw new ApiError(409, "User is already a member of this project");
  }

  const membership = await ProjectMember.create({
    project: req.project._id,
    user: userToAdd._id,
    role: role || UserRolesEnum.MEMBER,
  });

  const populated = await membership.populate("user", "username email");

  return res
    .status(201)
    .json(
      new ApiResponse(201, { member: populated }, "Member added successfully"),
    );
});

// ─── Update Member Role ───────────────────────────────────────────────────────
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Prevent demoting yourself
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot change your own role");
  }

  const membership = await ProjectMember.findOne({
    project: req.project._id,
    user: userId,
  });
  if (!membership) {
    throw new ApiError(404, "Member not found in this project");
  }

  membership.role = role;
  await membership.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { membership }, "Member role updated successfully"),
    );
});

// ─── Remove Member ────────────────────────────────────────────────────────────
export const removeProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent removing yourself
  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot remove yourself from the project");
  }

  const membership = await ProjectMember.findOneAndDelete({
    project: req.project._id,
    user: userId,
  });
  if (!membership) {
    throw new ApiError(404, "Member not found in this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});
