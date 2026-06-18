import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum, AvailableTaskStatuses } from "../config/constants.js";

const attachmentSchema = new Schema({
  url: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
});

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
