import { model, Schema } from "mongoose"

/**
 * Email logs for sent emails
 */
const Email: Schema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groups: {
      type: [
        {
          type: String,
          enum: [
            "PARTICIPANTS_VERIFIED",
            "PARTICIPANTS_COMPLETED",
            "PARTICIPANTS_CONFIRMED",
            "SPONSORS",
          ],
          required: true,
        },
      ],
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    sendTime: Number,
    status: {
      type: String,
      enum: [
        "QUEUED",
        "SENT",
        "ERROR",
        "DELETED"
      ],
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
)

export default model("Email", Email)
