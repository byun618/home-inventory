'use client';

import { io, Socket } from 'socket.io-client';

// 빈 string → 현재 페이지 origin 사용 (ngrok 등에서도 동작)
const WS_URL = '';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No token');

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
