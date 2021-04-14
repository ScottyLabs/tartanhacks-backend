import { model, Schema } from "mongoose"

/**
 * Schedule items for (potential) dynamic scheduling support
 */
const ScheduleItem: Schema = new Schema({
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  name: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  location: { type: String, required: true },
  lat: Number,
  lng: Number,
  platform: {
    type: String,
    enum: ["IN_PERSON", "ZOOM", "HOPIN", "DISCORD", "YOUTUBE", "OTHER"],
    required: true,
    default: "IN_PERSON"
  },
  platformUrl: String,
  active: { type: Boolean, rqeuired: true, default: true }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("ScheduleItem", ScheduleItem)
