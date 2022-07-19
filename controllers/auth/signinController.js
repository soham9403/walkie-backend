import { body, validationResult } from "express-validator"
import * as apiResponse from "../../helper/apiResponse.js"
import { comparePass } from "../../helper/passEncDec.js";
import UserModel from "../../models/UserModel.js";

import genrateToken from "./jwt/genrateToken.js";

const signinController = [
    body("email")
        .notEmpty({ ignore_whitespace: true }).withMessage("email_required").bail()
        .isEmail().withMessage("unvalid_email").trim().escape(),
    body("password")
        .notEmpty({ ignore_whitespace: true }).withMessage("password_required").trim().escape(),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error", errors.array())
        }

        const email = req.body.email
        const password = req.body.password

        return await UserModel.findOne({ email: email }).exec().then((user) => {
            if (user) {
                if (comparePass(password, user.password)) {
                    if(user._doc.password){
                        delete user._doc['password']
                    }
                    return apiResponse.successResponseWithData(res, "success_login", { ...user._doc, ...genrateToken(user._doc) })
                } else {
                    return apiResponse.validationErrorWithData(res, "Validation Error", [
                        {
                            "value": password,
                            "msg": "wrong_password",
                            "param": "password",
                            "location": "body"
                        }
                    ])
                }                
                // if(user.password)                
            } else {
                return apiResponse.validationErrorWithData(res, "Validation Error", [
                    {
                        "value": email,
                        "msg": "user_not_exist",
                        "param": "email",
                        "location": "body"
                    }
                ])
            }
        })

    }
]
export default signinController