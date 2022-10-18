import jwt from 'jsonwebtoken'
import userRole from '../config/constants/userRole.js'
import { errorResponse, forbiddenResponse } from '../helper/apiResponse.js'
import UserModel from '../models/UserModel.js'
// this function will use when there is user_code field in body or params
export const userCodeverifier = async (req, res, next) => {
  const usersRole = req.user_info.role
  const requestedserCode =
    req.body.user_code ||
    req.params.user_code ||
    req.query.user_code ||
    req.body.usercode ||
    req.params.usercode ||
    req.query.usercode
  if (req.user_info.usercode != requestedserCode) {
    const requestedUser = await UserModel.findOne({
      usercode: requestedserCode
    }).exec()
    if (requestedUser && parseInt(requestedUser.role) >= parseInt(usersRole)) {
      req.requested_user = requestedUser
    } else {
      return forbiddenResponse(res)
    }
  } else {
    req.requested_user = req.user_info
  }
  next()
}
