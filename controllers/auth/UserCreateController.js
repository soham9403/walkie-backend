import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import { user_role } from '../../helper/constants.js'
import { genrateRandomUserCode } from '../../helper/helperFunction.js'

import { encryptPass } from '../../helper/passEncDec.js'
import UserModal from '../../models/UserModel.js'

import * as apiResponse from './../../helper/apiResponse.js'
import genrateToken from './jwt/genrateToken.js'

const UserCreateController = [
  body('name')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('name_required')
    .trim()
    .escape(),
  body('company_name')
  .notEmpty({ ignore_whitespace: true })
    .withMessage('company_name_required')
    .trim()
    .escape(),

  body('email')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('email_required')
    .bail()
    .isEmail()
    .withMessage('unvalid_email')
    .bail()
    .custom(async value => {
      return await UserModal.findOne({ email: value })
        .exec()
        .then(user => {
          if (user) {
            return Promise.reject('email_already_in_use')
          } else {
            return Promise.resolve()
          }
        })
    })
    .withMessage('email_already_in_use')
    .trim()
    .escape(),

  body('phone_no')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('phone_required')
    .bail()
    // .isLength({ max: 10, min: 10 })
    // .withMessage('phone_invalid')
    .trim()
    .escape(),
  body('password')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('password_required')
    .trim()
    .escape()
    .customSanitizer(val => {
      return encryptPass(val)
    }),

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return apiResponse.validationErrorWithData(
        res,
        'validation_error',
        errors.array()
      )
    }

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const phone_no = req.body.phone_no
    let company_name = req.body.company_name

    const code = await genrateRandomUserCode(name)
    const role = user_role.NORMAL_USER

    return await UserModal.create({
      name,
      email,
      usercode:code,
      password,
      company_name,
      phone_no,
      role
    })
      .then(resPonse => {
        if (req.originalUrl == '/api/auth/signup') {
          if (resPonse._doc.password) {
            delete resPonse._doc['password']
          }
          return apiResponse.successResponseWithData(res, 'user_created', {
            ...resPonse._doc,
            ...genrateToken(resPonse._doc)
          })
        } else {
          return apiResponse.successResponse(res, 'user_created')
        }
      })
      .catch(err => {
        return apiResponse.serverErrorWithData(res, 'databse_error', [err])
      })
  }
]

export default UserCreateController
