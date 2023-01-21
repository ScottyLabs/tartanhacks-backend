import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IProject } from "../_types/Project";

/**
 * Team-submitted projects
 */
const Project: Schema<IProject> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    url: String,
    location: String,
    slides: String,
    video: String,
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    prizes: {
      type: [Schema.Types.ObjectId],
      ref: "Prize",
      required: true,
    },
    presentingVirtually: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IProject>("Project", Project, "projects", !isProduction);
