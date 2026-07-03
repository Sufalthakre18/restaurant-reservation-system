import {Server} from "socket.io";
import jwt from "jsonwebtoken"

let io;

// Initialize Socket.io on top of the existing HTTP server.

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    socket.join(`user_${id}`);
    if (role === 'admin') socket.join('admins');

    socket.on('disconnect', () => {
      // no-op: rooms are cleaned up automatically by socket.io
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  return io;
};

// Fire-and-forget notification helpers used by controllers
const notifyUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, payload);
};

const notifyAdmins = (event, payload) => {
  if (!io) return;
  io.to('admins').emit(event, payload);
};

export { initSocket, getIO, notifyUser, notifyAdmins };
