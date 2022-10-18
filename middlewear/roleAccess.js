import jwt from 'jsonwebtoken'
import userRole from '../config/constants/userRole.js';
import { errorResponse, forbiddenResponse } from '../helper/apiResponse.js';
// export const onlySuperAdminUser = (req, res, next) => {
//     const Bearer = req.header('Authorization');
//     const token = Bearer.replace("Bearer ", "")
//     const user = jwt.decode(token);
//     if (user && user.data && user.data.role == userRole.SUPER_ADMIN) {
//         next()
//     } else {
//         return forbiddenResponse(res)
//     }


// }
// export const aboveAdminUser = (req, res, next) => {
//     const Bearer = req.header('Authorization');
//     const token = Bearer.replace("Bearer ", "")
//     const user = jwt.decode(token);
//     if (user && user.data && (user.data.role == userRole.SUPER_ADMIN || user.data.role == userRole.ADMIN)) {
//         next()
//     } else {
//         return forbiddenResponse(res)
//     }
// }
// export const retellerNotAllowed = (req, res, next) => {
//     const Bearer = req.header('Authorization');
//     const token = Bearer.replace("Bearer ", "")
//     const user = jwt.decode(token);
//     if (user && user.data && (user.data.role != userRole.RETELLER_ROLE)) {
//         next()
//     } else {
//         return forbiddenResponse(res)
//     }
// }

export const roleAccess = (req, res, next, allowed = ['*']) => {
    const Bearer = req.header('Authorization');
    const token = Bearer.replace("Bearer ", "")
    const user = jwt.decode(token);
    if (allowed[0] === "*" || (allowed.indexOf(parseInt(user.data.role)) !== -1)){
        next()
    }else{
        return forbiddenResponse(res)
    }
}
