import * as apiResponse from "../../../helper/apiResponse.js"
import jwt from 'jsonwebtoken'
import userModel from "../../../models/UserModel.js";
import genrateToken from "./genrateToken.js";
const resetTokenController = async(req, res) => {

    let jwtSecretKey = process.env.JSON_REFRESH_TOKEN_SECRET_KEY;

    try {
        const token = req.body.refreshToken;
        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
           const user = jwt.decode(token);
            if(user.data._id){
                return await userModel.findOne({_id:user.data._id}).exec().then((user)=>{
                    if(user){
                        return apiResponse.successResponseWithData(res,"Token regenrated",genrateToken(user))
                    }else{
                        return apiResponse.unauthorizedResponse(res, "unAutherized Token");
                    }
                }).catch(()=>{
                    return apiResponse.unauthorizedResponse(res, "unAutherized Token");
                })
            }else{
                return apiResponse.unauthorizedResponse(res, "unAutherized Token");
            }
        //    return apiResponse.successResponse(res,);
        } else {
            // Access Denied
            return apiResponse.unauthorizedResponse(res, "Token Expired");
        }
    } catch (error) {
        // Access Denied
        return apiResponse.unauthorizedResponse(res, error);
    }


    apiResponse.successResponse(res, jwt.decode(req.body.refreshToken))
}
export default resetTokenController
