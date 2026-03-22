import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const base = apiUrl.replace('/api', '');
    socket = io(base, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
