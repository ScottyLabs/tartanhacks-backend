import { model, Schema } from "mongoose"

/**
 * User checkin instances, 
 * i.e. keeps track of when users complete checkin items
 * @see {@link CheckinItem}
 */
const Checkin: Schema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: "CheckinItem",
    required: true
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Checkin", Checkin)
