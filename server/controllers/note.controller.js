import { Note } from "../models/note.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── List Notes ───────────────────────────────────────────────────────────────
export const getProjectNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ project: req.project._id })
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { notes }, "Notes fetched successfully"));
});

// ─── Create Note ──────────────────────────────────────────────────────────────
export const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.create({
    title,
    content,
    project: req.project._id,
    createdBy: req.user._id,
  });

  const populated = await note.populate("createdBy", "username email");

  return res
    .status(201)
    .json(
      new ApiResponse(201, { note: populated }, "Note created successfully"),
    );
});

// ─── Get Note ─────────────────────────────────────────────────────────────────
export const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOne({
    _id: noteId,
    project: req.project._id,
  }).populate("createdBy", "username email");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { note }, "Note fetched successfully"));
});

// ─── Update Note ──────────────────────────────────────────────────────────────
export const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, project: req.project._id },
    { $set: { title, content } },
    { new: true, runValidators: true },
  ).populate("createdBy", "username email");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { note }, "Note updated successfully"));
});

// ─── Delete Note ──────────────────────────────────────────────────────────────
export const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    project: req.project._id,
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});
