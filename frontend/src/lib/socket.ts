import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Connects once per session using the current JWT. Call disconnectSocket()
// on logout so a stale/authenticated socket doesn't linger.
export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
