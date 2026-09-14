import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getClientSocket(token?: string): Socket {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      auth: {
        token: token || localStorage.getItem('auth_token') || '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  } else if (token) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
}

export function disconnectClientSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
