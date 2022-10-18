import express from 'express'

import GetUserByTOkenController from '../controllers/auth/GetUserByTOkenController.js'
import FetchRoomInfoController from '../controllers/rooms/FetchRoomInfoController.js'
import jwtVerifier from '../middlewear/jwtverifiers.js'




const privateRoute = express.Router()
privateRoute.get("/user",jwtVerifier,GetUserByTOkenController)

privateRoute.get("/room-info",jwtVerifier,FetchRoomInfoController)



export default privateRoute