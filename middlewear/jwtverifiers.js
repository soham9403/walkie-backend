import * as apiResponse from '../helper/apiResponse.js'
import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js'
import mongoose from 'mongoose'
const jwtVerifier = async(req, res, next) => {
  let jwtSecretKey = process.env.JSON_WEB_TOKEN_SECRET_KEY

  try {
    const Bearer = req.header('Authorization')
    const token = Bearer.replace('Bearer ', '')

    const verified = jwt.verify(token, jwtSecretKey, { complete: true })
    if (verified) {
      const user = await UserModel.findOne({
        _id: mongoose.Types.ObjectId(verified.payload.data._id)
      })
      if(!user){
        return apiResponse.forbiddenResponse(res, 'token temperred')
      }
      req.user_info = user._doc
      next()
    } else {
      // Access Denied
      return apiResponse.unauthorizedResponse(res, 'token required')
    }
    // return apiResponse.unauthorizedResponse(res,error);
  } catch (error) {
    // Access Denied
    return apiResponse.unauthorizedResponse(res, error)
  }
}
export default jwtVerifier
