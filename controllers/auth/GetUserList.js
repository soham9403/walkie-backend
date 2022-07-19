import UserModel from '../../models/UserModel.js'
import * as apiResponse from '../../helper/apiResponse.js'
import userRole from '../../config/constants/userRole.js'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
const GetUserList = async (req, res) => {
  let aggrigation = []
  let page_no = 1
  let page_size = 10
  const matchQuery = { $match: {} }
  const sortQuery = { $sort: { createdAt: -1 } }
  const request_params = req.query

  //this is because when api is called from sign up then  user cant hack it without token
  let onlyDestributorList = false
  if (req.originalUrl.split('?').shift() !== '/api/app/user/list') {
    onlyDestributorList = true
  }
  let tokenData = {}
  if (!onlyDestributorList) {
    const Bearer = req.header('Authorization')
    const token = Bearer.replace('Bearer ', '')
    tokenData = jwt.decode(token).data
  }

  if (request_params && request_params.page_size) {
    page_size = parseInt(request_params.page_size)
  }
  if (request_params && request_params.page_no) {
    page_no = parseInt(request_params.page_no)
  }

  if (request_params.search && request_params.search != '') {
    let serach = ''
    serach = request_params.search
    matchQuery.$match.$text = { $search: serach }
  }
  const usercode = request_params.usercode
  let notAllowed = false
  if (!onlyDestributorList && (!request_params.all_retailers || request_params.all_retailers=="false")) {
    await UserModel.findOne({ usercode: usercode })
      .exec()
      .then(userResponse => {
        if (!userResponse) {
          return apiResponse.validationErrorWithData(res, 'user_not_exist', [
            { msg: 'user_not_exist' }
          ])
        }

        const role =
          (tokenData.role == userRole.SUPER_ADMIN ||
            tokenData.role == userRole.PRODUCT_MANAGER ||
            tokenData.role == userRole.ADMIN) &&
          userResponse.role != userRole.DESTRIBUTOR_ROLE
            ? request_params.role
            : parseInt(userResponse.role) + 1

        if (role && role != '') {
          matchQuery.$match['role'] = role.toString()
          if (userResponse.role == userRole.DESTRIBUTOR_ROLE) {
            const destributor_id = userResponse._id
            matchQuery.$match['destributor_id'] = mongoose.Types.ObjectId(
              destributor_id
            )
          }

          let verified = false
          if (request_params.verified) {
            verified = request_params.verified == 'true'
          }
          matchQuery.$match['verfied'] = verified
        } else {
          notAllowed = userResponse.role == userRole.RETELLER_ROLE
        }
      })
  }

  if (!onlyDestributorList && request_params.all_retailers=='true') {
    if (
      tokenData.role == userRole.SUPER_ADMIN ||
      tokenData.role == userRole.PRODUCT_MANAGER ||
      tokenData.role == userRole.ADMIN
    )
      matchQuery.$match['role'] = userRole.RETELLER_ROLE.toString()
  }
  if (onlyDestributorList) {
    matchQuery.$match['role'] = userRole.DESTRIBUTOR_ROLE.toString()
  }

  matchQuery.$match['deleted'] = false
  aggrigation = [matchQuery, sortQuery]
  const countAggrigaton = [
    matchQuery,
    { $count: 'total' }
    // sortQuery,
  ]

  if (!request_params.all) {
    aggrigation.push({ $skip: page_size * (page_no - 1) })
    aggrigation.push({ $limit: page_size })
  }

  if (onlyDestributorList) {
    aggrigation.push({
      $project: {
        name: 1,
        usercode: 1,
        email: 1,
        phone_no: 1,
        territory: 1
      }
    })
  } else {
    aggrigation.push({
      $project: {
        password: 0
      }
    })
  }
  if (notAllowed) {
    const passdata = {
      total: 0,
      page_no: page_no,
      page_size: page_size,
      result: []
    }
    return apiResponse.successResponseWithData(res, 'success', passdata)
  }
  await Promise.all([
    UserModel.aggregate(countAggrigaton).exec(),
    UserModel.aggregate(aggrigation).exec()
  ])
    .then(responseArr => {
      const passdata = {
        ...responseArr[0][0],
        page_no: page_no,
        page_size: page_size,
        result: responseArr[1]
      }
      return apiResponse.successResponseWithData(res, 'success', passdata)
    })
    .catch(err => {
      return apiResponse.serverErrorWithData(res, 'databse error', err)
    })
}
export default GetUserList
