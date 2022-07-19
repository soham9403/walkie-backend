import mongoose from 'mongoose'
import { user_role } from '../helper/constants.js'

import modelFiledDefinations from '../helper/modelFiledDefinations.js'

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    name: modelFiledDefinations.stringAndRequired,
    usercode:modelFiledDefinations.stringAndUnique,
    email: modelFiledDefinations.stringAndUnique,
    password: modelFiledDefinations.stringAndRequired,
    company_name: modelFiledDefinations.stringAndRequired,
    role: modelFiledDefinations.enumAndRequired(Object.values(user_role)),
    phone_no: modelFiledDefinations.stringAndRequired,
    rooms:{
      type: [
        {
          name:{
            type:String,
            default:""
          },
          _id: { type: Schema.ObjectId, ref: 'rooms', required: true },
        }
      ],
      default:[]
    }
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
