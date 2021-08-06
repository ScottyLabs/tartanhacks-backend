import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { IPrize } from "../_types/Prize";

/**
 * Prizes in each event e.g. Grand Prize, Best in Design
 */
const Prize: Schema<IPrize> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: String,
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Sponsor",
      required: false,
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model<IPrize>("Prize", Prize, "prizes", !isProduction);
