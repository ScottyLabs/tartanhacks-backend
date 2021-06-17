import { model, Schema } from "mongoose";
import isProduction from "src/util/isProduction";
import {
  TeamRequestType,
  TeamRequestStatus,
  ITeamRequest,
} from "../_types/TeamRequest";

/**
 * Requests from users to join teams and invitations from teams to individual users
 */
const TeamRequest: Schema<ITeamRequest> = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TeamRequestType),
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TeamRequestStatus),
      default: TeamRequestStatus.PENDING,
      required: true,
    },
    message: String,
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export default model("TeamRequest", TeamRequest, "team-requests", !isProduction);
