"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
let io;
const initSocket = (server) => {
    io = server;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io)
        throw new Error('Socket.IO no ha sido inicializado. Llama initSocket() primero.');
    return io;
};
exports.getIO = getIO;
