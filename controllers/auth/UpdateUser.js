
import { body, validationResult } from 'express-validator'
import userRole from '../../config/constants/userRole.js';
import { genrateRandomUserCode } from '../../helper/helperFunction.js';
import { encryptPass } from '../../helper/passEncDec.js';
import userModel from '../../models/UserModel.js';
import mongoose from 'mongoose'
import * as apiResponse from './../../helper/apiResponse.js'
import genrateToken from './jwt/genrateToken.js';



const UpdateUser = [
    body("user_id").notEmpty({ ignore_whitespace: true }).withMessage("user_required").trim().escape(),
    body("name").notEmpty({ ignore_whitespace: true }).withMessage("name_required").trim().escape(),
    
    body("company_name").custom((value, { req }) => {
        const role = req.body.role
        if ((role == userRole.RETELLER_ROLE || role == userRole.DESTRIBUTOR_ROLE) && (!value || value == '')) {
            throw new Error('company_name_required');
        }
        return true

    }).withMessage("company_name_required").trim().escape(),
    body("gst_no").custom((value, { req }) => {
        const role = req.body.role
        if ((role == userRole.RETELLER_ROLE || role == userRole.DESTRIBUTOR_ROLE) && (!value || value == '')) {
            throw new Error('gst_no_required');
        }
        // if ((role == userRole.RETELLER_ROLE || role == userRole.DESTRIBUTOR_ROLE) && !new RegExp('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]1}[1-9A-Z]{1}Z[0-9A-Z]{1}$').test(value)) {
            
        //     throw new Error('invalid_gst_no');
            
        // }
        return true

    }).trim().escape(),
    body("phone_no").notEmpty({ ignore_whitespace: true }).withMessage("phone_required").isLength({ max: 10, min: 10 }).withMessage("phone_invalid").trim().escape(),
    
    body("role").notEmpty({ ignore_whitespace: true }).withMessage("role_required").bail()
        .isIn(Object.values(userRole)).withMessage("invalid_role").trim().escape(),
    body("destributor_id").custom((val, { req }) => {
        if (req.body.role && req.body.role == userRole.RETELLER_ROLE && (!val || val.trim() === "")) {
            throw new Error('destributor_required');
        }
        return true
    }),
    body("territory").custom((val, { req }) => {
        if (req.body.role && (req.body.role == userRole.DESTRIBUTOR_ROLE) && (!val || val.trim() === "")) {
            throw new Error('territory_required');
        }
        return true
    }),

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error", errors.array())
        }
        const user_id = req.body.user_id
        const name = req.body.name
        // const email = req.body.email

        const phone_no = req.body.phone_no
        let company_name = req.body.company_name
        let gst_no = req.body.gst_no

        const role = req.body.role
        let destributor_id = null
        // let verfied = 1

        if (role != userRole.RETELLER_ROLE && role != userRole.DESTRIBUTOR_ROLE) {
            company_name = process.env.COMPANY_NAME
            gst_no = process.env.COMPANY_GST
        }
        if (role == userRole.RETELLER_ROLE) {
            destributor_id = req.body.destributor_id
        }


        let territory = ''
        if (role == userRole.DESTRIBUTOR_ROLE) {
            territory = req.body.territory
        }


        if (role == userRole.RETELLER_ROLE) {
            await userModel.findOne({ _id: mongoose.Types.ObjectId(destributor_id) }).then((user) => {
                if (user) {
                    territory = user.territory
                } else {
                    return apiResponse.validationErrorWithData(res, "validation_error", [{
                        "msg": "destributor_not_exist",
                        "param": "destributor_id",
                        "location": "body"
                    }])
                }
            }).catch((err) => {
                return apiResponse.serverErrorWithData(res, "databse_error", [err])
            })

        }


        return await userModel.updateOne({
            name,
            phone_no,
            role,
            territory,
            company_name,
            gst_no,
            destributor_id,

        }).where({ _id: mongoose.Types.ObjectId(user_id) }).then((resPonse) => {
            return apiResponse.successResponse(res, "profile_updated")

        }).catch(err => {
            return apiResponse.serverErrorWithData(res, "databse_error", [err])
        })


    }
]

export default UpdateUser