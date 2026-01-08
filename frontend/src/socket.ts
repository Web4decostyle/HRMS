import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: string) {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket?.id);
      socket?.emit("join", userId);
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}
