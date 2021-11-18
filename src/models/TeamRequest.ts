import { model, Schema } from "mongoose";
import isProduction from "../util/isProduction";
import { ITeamRequest } from "../_types/TeamRequest";
import { TeamRequestType, TeamRequestStatus } from "../_enums/TeamRequest";

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
    seen: {
      type: Boolean,
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

export default model<ITeamRequest>(
  "TeamRequest",
  TeamRequest,
  "team-requests",
  !isProduction
);
