
import { query, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import * as apiResponse from '../../helper/apiResponse.js'
import { isUserInRoom } from '../../helper/helperFunction.js'
import RoomsModal from '../../models/RoomsModal.js'
const FetchRoomInfoController = [
  query('room')
    .notEmpty({ ignore_whitespace: true })
    .withMessage('room is required')
    .bail()
    .custom(async (val, { req }) => {
      return await RoomsModal.findOne({ _id: mongoose.Types.ObjectId(val) }).then((roomInfo) => {
        if (!roomInfo) {

          return Promise.reject('Room not found')
        }

        req.requested_room = roomInfo

        if (roomInfo && !isUserInRoom(req)) {

          return Promise.reject('You are not allowed to perform this action')
        }
        return Promise.resolve()
      })



    }), async (req, res) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return apiResponse.validationErrorWithData(
            res,
            'validation_error',
            errors.array()
          )
        }

        const userData = { ...req.user_info }
        const { room } = req.query
        const query = [
          {
            $match: { _id: mongoose.Types.ObjectId(room) },
          },
          {
            $unwind: { path: "$users" }
          }
          , {
            $lookup: {
              from: 'users',
              localField: 'users.usercode',
              pipeline: [{
                $project: {
                  password: 0,
                  rooms: 0,
                  role: 0
                }
              }],
              foreignField: 'usercode',
              as: 'users.details'
            }
          },
          {
            $unwind: { path: "$users.details" }
          },
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              createdBy: { $first: "$createdBy" },
              users: { $push: "$users" }
            }
          }

        ]
        const roomInfo = await RoomsModal.aggregate(query).exec()
        
        return apiResponse.successResponseWithData(res, 'fetched users', roomInfo[0])
      } catch (e) {
        return apiResponse.errorResponse(res, e.message)
      }

    }]
export default FetchRoomInfoController