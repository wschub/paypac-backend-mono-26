import { Server } from 'socket.io';

let io: Server;

export const initSocket = (server: Server): void => {
  io = server;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO no ha sido inicializado. Llama initSocket() primero.');
  return io;
};