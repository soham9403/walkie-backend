import UserModel from "../../models/UserModel.js"
import * as apiResponse from '../../helper/apiResponse.js';
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
const VerifyReteller = [
    body("user_id").notEmpty({ ignore_whitespace: true }).withMessage("user_required").trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error", errors.array())
        }
        return await UserModel.updateOne({ verfied: true }).where({ _id: mongoose.Types.ObjectId(req.body.user_id) }).exec().then(() => {
            return apiResponse.successResponse(res, "user verified successfully")
        }).catch(err => {
            return apiResponse.serverErrorWithData(res, "databse error", err)
        })
    }]
export default VerifyReteller