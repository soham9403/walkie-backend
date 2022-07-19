import express from 'express'

import GetUserByTOkenController from '../controllers/auth/GetUserByTOkenController.js'
import jwtVerifier from '../middlewear/jwtverifiers.js'
// import GetUserList from '../controllers/auth/GetUserList.js'



const privateRoute = express.Router()
privateRoute.get("/user",jwtVerifier,GetUserByTOkenController)



export default privateRoute