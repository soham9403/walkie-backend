import { body, validationResult } from 'express-validator'
import * as apiResponse from '../../helper/apiResponse.js'
import OTPModel from '../../models/OTPModel.js'
import userModel from '../../models/UserModel.js'
import mongoose from 'mongoose'
import { compareDate, generateOTP } from '../../helper/helperFunction.js'
import ejs from 'ejs'
import fs from 'fs'

import { dirname } from 'path'

const mailTemplate = data => {
  const readedString = fs.readFileSync(
    dirname('') + '/templates/otptemplate.ejs'
  )
  
  return ejs.render(readedString.toString(), data)
}
import { sendMail } from '../mail/mailConfig.js'
const SendOtp = [
  body('unique_key')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('email_usercode_required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        'Validation Error',
        errors.array()
      )
    }

    const unique_key = req.body.unique_key

    return await userModel
      .findOne({ $or: [{ email: unique_key }, { usercode: unique_key }] })
      .then(async user => {
        if (user) {
          return await OTPModel.findOne({
            user_id: mongoose.Types.ObjectId(user._id)
          })
            .then(async otpDoc => {
              if (
                otpDoc &&
                compareDate(otpDoc.createdAt, new Date(), 300000) === 1
              ) {
                return await sendMail(
                  user.email,
                  'OTP By ' + process.env.APP_NAME,
                  'your otp for ' + process.env.APP_NAME + ' is :' + otpDoc.otp,
                  mailTemplate({ otp: otpDoc.otp })
                )
                  .then(() => {
                    return apiResponse.successResponseWithData(
                      res,
                      'Otp sent to ' + user.email,
                      { user_id: user._id }
                    )
                  })
                  .catch(e => {
                    return apiResponse.errorResponse(
                      res,
                      'mail cant be sent to 1 ' + e.message + user.email
                    )
                  })
              } else {
                
                if (
                  otpDoc &&
                  compareDate(otpDoc.createdAt, new Date(), 300000) !== 1
                ) {
                  await OTPModel.deleteOne({
                    user_id: mongoose.Types.ObjectId(user._id)
                  })
                }
                const otp = generateOTP()
                await OTPModel.create({
                  user_id: user._id,
                  otp: otp
                }).catch(() => {
                  return apiResponse.errorResponse(
                    res,
                    'mail cant be sent to 2' + user.email
                  )
                })
                return await sendMail(
                  user.email,
                  'OTP By ' + process.env.APP_NAME,
                  'your otp for ' + process.env.APP_NAME + ' is :' + otp,
                  mailTemplate({ otp: otp })
                )
                  .then(() => {
                    return apiResponse.successResponseWithData(
                      res,
                      'Otp sent to ' + user.email,
                      { user_id: user._id }
                    )
                  })
                  .catch(err => {
                    return apiResponse.serverErrorWithData(
                      res,
                      'mail cant be  sent to 3' + user.email,
                      err
                    )
                  })
              }
            })
            .catch(err => {
              return apiResponse.serverErrorWithData(res, err.message, err)
            })
        } else {
          return apiResponse.validationErrorWithData(res, 'Validation Error', [
            {
              value: unique_key,
              msg: 'user_not_exist',
              location: 'body'
            }
          ])
        }
      })
      .catch(err => {
        return apiResponse.serverErrorWithData(res, 'database error', err)
      })
  }
]
export default SendOtp
