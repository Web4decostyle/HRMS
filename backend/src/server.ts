// backend/src/server.ts
import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";

async function start() {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`🚀 API server running on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
    process.exit(1);
  }
}

void start();
