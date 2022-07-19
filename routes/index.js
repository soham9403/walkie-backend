import express from 'express'
import authRouter from './authroute.js'
import privateRoute from './privateRoute.js'
const app = express()

app.use("/auth/", authRouter)
app.use("/app/", privateRoute)

export default app