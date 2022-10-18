import { body, check, validationResult } from 'express-validator'
import * as apiResponse from '../../helper/apiResponse.js'

import mongoose from 'mongoose'
import OTPModel from '../../models/OTPModel.js'
import userModel from '../../models/UserModel.js'
import { compareDate } from '../../helper/helperFunction.js'
import jwt from 'jsonwebtoken'
import { encryptPass } from '../../helper/passEncDec.js'
const changePassword = [
  body('user_id')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('user id is required')
    .bail()
    .custom(async val => {
      return await userModel
        .findOne({ _id: val })
        .exec()
        .then(user => {
          if (!user) {
            return Promise.reject('user not found')
          }
          return Promise.resolve()
        })
    }),
  body('token')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('token id is required'),
  body('password')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('password  is required'),
  body('confirm_password')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('confirm-password  is required')
    .bail()
    .custom((val, { req }) => {
      if (req.body.password != val) {
        throw new Error('confirm-password and password must be same')
      } else {
        return true
      }
    })
    .withMessage(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        'Validation Error',
        errors.array()
      )
    }
    try {
      let jwtSecretKey = process.env.JSON_OTP_REFRESH_TOKEN_SECRET_KEY
      const {token} = req.body
      const pass = req.body.password
      const user_id = req.body.user_id
      const verified = jwt.verify(token, jwtSecretKey)
      if (verified) {
        const otpSecret = verified.data.token

         await OTPModel.find({ user_id: mongoose.Types.ObjectId(user_id) })
          .sort({ createdAt: -1 })
          .limit(1)
          .exec()
          .then(otpdoc => {
            const latestDoc = otpdoc[0]
            if (!latestDoc) {
             return apiResponse.forbiddenResponse(res,'You are trying to change password directly')
            }
            if (latestDoc.otpSecret != otpSecret) {
              return apiResponse.validationErrorWithData(res,'unvalid request',[{message:'time limit expired or you made bad request'}])
            } 
            
          })
      } else {
        // Access Denied
        return apiResponse.unauthorizedResponse(res, 'Secret token Expired')
      }
   
      return await userModel
        .updateOne({
          password: encryptPass(pass)
        })
        .where({ _id: user_id })
        .exec()
        .then(() => {
          return apiResponse.successResponse(
            res,
            'password updated successfully'
          )
        })
    } catch (e) {
      return apiResponse.errorResponse(res, e.message)
    }
  }
]
export default changePassword
