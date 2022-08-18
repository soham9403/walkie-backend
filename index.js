import express from 'express'

import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { createServer } from 'http'
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv'
import cors from 'cors'
// import RoomsModal from './models/RoomsModal.js'
import indexroute from './routes/index.js'
import RoomsModal from './models/RoomsModal.js'
import UserModel from './models/UserModel.js'
import { ErrorResponse } from './helper/apiResponse.js'

dotenv.config()
const app = express()

const httpServer = createServer(app, {
  cors: '*'
})
var MONGODB_URL = process.env.MONGODB_URL
// if (process.env.MODE == 'production')
//   MONGODB_URL = process.env.MONGODB_URL_PRODUCTION
mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to %s', process.env.MODE)
  })
  .catch(err => {
    console.error('App starting error:', err.message)
    process.exit(1)
  })

export const port = process.env.PORT || '8000'
try{
app.use(express.static('public'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

app.use('/api/', indexroute)

httpServer.listen(port, () => {
  console.log('APP is running on port ' + port)
})



const io = new Server(httpServer, { cors: '*' })

io.on('connection', socket => {
  console.log('user connected')
  socket.on('user_online', async userdata => {
    userdata = JSON.parse(userdata)
    socket.user = { ...userdata }
  })

  socket.on('create_room', async (data, callback) => {
    try {
      const { name, users, creator } = JSON.parse(data)

      if (name == '') {
        callback({
          status: 0,
          message: 'Rooom name is required'
        })

        return
      }
      if (users.length < 0) {
        callback({
          status: 0,
          message: 'Add users to room'
        })

        return
      }
      if (
        !creator ||
        (creator && (creator.usercode == '' || creator.id == ''))
      ) {
        callback({
          status: 0,
          message: 'No creator found'
        })

        return
      }
      users.push(creator.usercode)

      const fetchedusers = await UserModel.find(
        { usercode: { $in: users } },
        { name: 1, usercode: 1 }
      )

      const room = await RoomsModal.create({
        name,
        users: fetchedusers,
        createdBy: mongoose.Types.ObjectId(creator.id)
      })

      await UserModel.updateMany(
        { usercode: { $in: users } },
        {
          $push: {
            rooms: { _id: mongoose.Types.ObjectId(room._id), name: room.name }
          }
        }
      )

      io.sockets.sockets.forEach(users_socket_instance => {
        if (
          users_socket_instance.user &&
          users.includes(users_socket_instance.user.usercode)
        ) {
          
          users_socket_instance.join(room._id.toString())
        }
      })
      
      socket.broadcast.to(room._id.toString()).emit('room_created', room)
      callback({
        status: 1,
        message: 'Room created'
      })
    } catch (e) {
      callback({
        status: 0,
        message: e.message
      })
    }
  })

  socket.on('join_room', async data => {
    let { room } = data
    socket.join(room)
    socket.broadcast.to(room).emit(socket.user.name + ' joinded the chat')
  })

  socket.on('join_rooms', async (data, callback) => {
    try {
      let { rooms } = data

      for (let room of rooms) {
        socket.join(room)
        socket.broadcast.to(room).emit('user_chat_joined', {
          roomId: room,
          message: 'new user joined chat'
        })
      }

      callback({
        status: 1,
        message: 'all rooms joined'
      })

      return
    } catch (e) {
      callback({
        status: 0,
        message: e.message
      })
      return
    }
  })

  socket.on('message', async data => {
    let { room, message } = data
    socket.broadcast.to(room).emit('chat', {
      roomId: room,
      message,
      user: socket.user.name
    })
  })

  socket.on('pressbutton', async (data, callback) => {
    try {
      let { room, message } = data
      socket.broadcast.to(room).emit('pressbutton', {
        roomId: room,
        message
      })
      callback({
        status: 1,
        message: ''
      })
    } catch (e) {
      callback({
        status: 0,
        message: e.message
      })
    }
  })
  socket.on('releasebutton', async (data, callback) => {
    try {
      let { room, message } = data
      socket.broadcast.to(room).emit('releasebutton', {
        roomId: room,
        message
      })
      callback({
        status: 1,
        message: ''
      })
    } catch (e) {
      callback({
        status: 0,
        message: e.message
      })
    }
  })

  socket.on('audio', async data => {
    let { room, audio } = data

    
    socket.broadcast.to(room).emit('audio', {
      roomId: room,
      audio
    })
  })

  socket.on('disconnect', () => {
    const user = socket.user
  })
})

io.engine.on('connection_error', err => {
  console.log(err.req) // the request object
  console.log(err.code) // the error code, for example 1
  console.log(err.message) // the error message, for example "Session ID unknown"
  console.log(err.context) // some additional error context
})
}catch(e){
   app.response.send(e.message)
}