import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HTTPServer) {
  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-shop', (shopId: string) => {
      socket.join(`shop-${shopId}`);
      console.log(`Socket ${socket.id} joined shop-${shopId}`);
    });

    socket.on('leave-shop', (shopId: string) => {
      socket.leave(`shop-${shopId}`);
      console.log(`Socket ${socket.id} left shop-${shopId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function notifyFileUpload(shopId: string, fileData: any) {
  if (io) {
    io.to(`shop-${shopId}`).emit('file-uploaded', fileData);
  }
}
