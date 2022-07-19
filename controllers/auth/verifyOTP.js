import { body, check, validationResult } from 'express-validator'
import * as apiResponse from '../../helper/apiResponse.js'

import mongoose from 'mongoose'
import OTPModel from '../../models/OTPModel.js'
import userModel from '../../models/UserModel.js'
import { compareDate, getRndInteger } from '../../helper/helperFunction.js'
import { generateOTPVerifiedToken } from './jwt/genrateToken.js'
const verifyOTP = [
  body('otp')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('OTP is required'),
  body('user_id')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('user id is required'),
  body('user_id').custom(async (val, { req }) => {
    return await OTPModel.find({ user_id: mongoose.Types.ObjectId(val) })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec()
      .then(otpdoc => {
        const latestDoc = otpdoc[0]
        if (!latestDoc) {
          throw new Error('otp document not found')
        }
        if (latestDoc.otp != req.body.otp) {
          throw new Error('wrong otp')
        } else if (compareDate(latestDoc.createdAt, new Date(), 300000) !== 1) {
          throw new Error('otp expired')
        }
        return true
      })
  }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        'Validation Error',
        errors.array()
      )
    }
    const secret = getRndInteger(111111111111, 999999999999)
    const response = await OTPModel.updateOne(
      {
        user_id: mongoose.Types.ObjectId(req.body.user_id)
      },
      {
        otpSecret: secret
      }
    )
    return apiResponse.successResponseWithData(res, 'Otp is verified', {
      token: generateOTPVerifiedToken({ token: secret })
    })
  }
]
export default verifyOTP
