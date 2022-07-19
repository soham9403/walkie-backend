import express from 'express'
import changePassword from '../controllers/auth/changePassword.js'
// import GetUserList from '../controllers/auth/GetUserList.js'
import resetTokenController from '../controllers/auth/jwt/resetTokenController.js'
import SendOtp from '../controllers/auth/SendOtp.js'
import signinController from '../controllers/auth/signinController.js'
import UserCreateController from '../controllers/auth/UserCreateController.js'
import verifyOTP from '../controllers/auth/verifyOTP.js'


const authRouter = express.Router()
authRouter.post("/reset-token",resetTokenController)
authRouter.post("/sign-in",signinController)
authRouter.post("/sendotp",SendOtp)
authRouter.post("/verifyotp",verifyOTP)
authRouter.put("/changepassword",changePassword)
authRouter.post("/signup",UserCreateController)
export default authRouter