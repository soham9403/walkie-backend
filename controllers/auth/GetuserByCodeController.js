import { body, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import * as apiResponse from '../../helper/apiResponse.js';
import UserModel from '../../models/UserModel.js';
const GetuserByCodeController = [

    // query("user_code").notEmpty({ ignore_whitespace: true }).withMessage("User Code is Required").trim().escape(),

    async (req, res) => {
 
        const userId = req.user_info._id
 
        return await UserModel.findOne({ _id: mongoose.Types.ObjectId(userId) }).exec().then((user) => {
            if (user) {
                if (user._doc.password) {
                    delete user._doc['password']
                }
                return apiResponse.successResponseWithData(res, "Success", user._doc)
            } else {
                return apiResponse.validationErrorWithData(res, "User Not found", [{
                    msg: "user not found"
                }])
            }
        })
    }]

export default GetuserByCodeController