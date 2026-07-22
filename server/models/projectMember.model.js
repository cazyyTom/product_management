import mongoose, { Schema } from "mongoose";
import { UserRolesEnum, AvailableUserRoles } from "../config/constants.js";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true },
);

// Each user can only have one role per project
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
