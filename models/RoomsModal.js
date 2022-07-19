import mongoose from 'mongoose'

import modelFiledDefinations from '../helper/modelFiledDefinations.js'

const Schema = mongoose.Schema

const roomsSchema = new Schema(
  {
    name: modelFiledDefinations.stringAndRequired,
    createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
    users: {
      type: [
        {
          usercode: modelFiledDefinations.stringOnly,
          name: modelFiledDefinations.stringOnly,
          _id: { type: Schema.ObjectId, ref: 'User', required: true },
        }
      ]
    }
  },
  { timestamps: true }
)

export default mongoose.models.rooms || mongoose.model('rooms', roomsSchema)
