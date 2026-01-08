// backend/src/server.ts
import http from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { initSocket } from "./socket";

async function start() {
  try {
    await connectDB();

    // ✅ Create HTTP server (required for socket.io)
    const server = http.createServer(app);

    // ✅ Init socket server
    initSocket(server);

    server.listen(ENV.PORT, () => {
      console.log(`🚀 API + Socket server running on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
    process.exit(1);
  }
}

void start();
