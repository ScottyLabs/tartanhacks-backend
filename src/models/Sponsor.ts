import { model, Schema } from "mongoose"

/**
 * Corporate/other sponsors with special access to public participant information
 */
const Sponsor: Schema = new Schema({
  name: { type: String, required: true },
  event: { 
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  representatives: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    required: true,
    default: []
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
})

export default model("Sponsor", Sponsor)
