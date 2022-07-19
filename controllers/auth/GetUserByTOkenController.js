import * as apiResponse from '../../helper/apiResponse.js'
const GetUserByTOkenController = (req, res) => {
  const userData = { ...req.user_info }
  delete userData['password']
  return apiResponse.successResponseWithData(res, 'fetched user', userData)
}
export default GetUserByTOkenController