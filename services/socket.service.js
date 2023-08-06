import { logger } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(http) {
  gIo = new Server(http, {
    cors: {
      origin: '*',
    },
  })
  gIo.on('connection', (socket) => {
    logger.info(`New connected socket [id: ${socket.id}]`)
    socket.on('disconnect', (socket) => {
      logger.info(`Socket disconnected [id: ${socket.id}]`)
    })

    socket.on('chat-set-topic', (topic) => {
      if (socket.myTopic === topic) return
      if (socket.myTopic) {
        socket.leave(socket.myTopic)
        logger.info(
          `Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`
        )
      }
      socket.join(topic)
      socket.myTopic = topic
      console.log(socket.myTopic);
    })

    // socket.on('chat-send-msg', ({action, payload}) => {
    //   logger.info(
    //     `New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`
    //   )
    //   broadcast({
    //     type: `chat-${action}-msg`,
    //     data: payload,
    //     room: socket.myTopic,
    //     userId: socket.userId,
    //   })
    // })

    socket.on('chat-send-msg', ({action, payload}) => {
        console.log('payload', payload,'action', action);
        logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
        // emits to all sockets:
        // gIo.emit('chat addMsg', msg)
        // emits only to sockets in the same room
        gIo.to(socket.myTopic).emit(`chat-${action}-msg`, payload)
        
    })
    socket.on('board-update', (board) => {
      console.log(board);
        // console.log('payload', payload,'action', action);
        logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
        gIo.to(socket.myTopic).emit(`on-board-update`, board)
        
    })

    socket.on('chat-set-user-is-typing', (username) => {
      socket.broadcast.to(socket.myTopic).emit('chat-user-is-typing', username)
    })
    socket.on('update-task', (task) => {
      socket.broadcast.to(socket.myTopic).emit('on-update-task', task)
    })
    socket.on('notification-push', ({notification,members}) => {
      members.forEach(m =>{
        emitToUser({type:'on-notifcation-push',data:notification,userId:m.id})
      })
      socket.broadcast.to(socket.myTopic).emit('on-update-task', task)
    })

    // socket.on('shop-admin-changed')
    socket.on('set-user-socket', ({userId,username}) => {
      logger.info(
        `Setting socket.userId = ${userId} username: ${username}for socket [id: ${socket.id}]`
      )
      socket.userId = userId
      socket.username = username
    })

    socket.on('unset-user-socket', () => {
      logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
      delete socket.userId
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to('watching:' + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    logger.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`
    )
    socket.emit(type, data)
  } else {
    logger.info(`No active socket for user: ${userId}`)
    // _printSockets()
  }
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId = '' }) {
  userId = userId.toString()
  console.log(userId);

  logger.info(`Broadcasting event: ${type}`)
  const excludedSocket = await _getUserSocket(userId)
  if (room && excludedSocket) {
    logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    logger.info(`Broadcast to all excluding user: ${userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    logger.info(`Emit to room: ${room}`)
    gIo.to(room).emit(type, data)
  } else {
    logger.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function broadcastAdminUpdate({ productName, type, adminId }) {
  return broadcast({
    type: 'admin-update',
    data: _getAdminMsg(productName, type),
    userId: adminId,
  })
}

async function _getUserSocket(userId) {
  const sockets = await _getAllSockets()

  const socket = sockets.find((s) => s.userId === userId)

  return socket
}

async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  return sockets
}

function _getAdminMsg(productName, type) {
  let suffix = 'go check it out!'
  if (type === 'remove') suffix = 'it is no longer available.'
  return `An admin has ${type}ed ${productName}, ${suffix}`
}

async function _printSockets() {
  const sockets = await _getAllSockets()
  console.log(`Sockets: (count: ${sockets.length}):`)
  sockets.forEach(_printSocket)
}
function _printSocket(socket) {
  console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

export const socketService = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
  broadcastAdminUpdate,
}
