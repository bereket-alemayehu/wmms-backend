import http from "http";
import dotenv from "dotenv";
dotenv.config();
import connectToDatabase from "./src/config/dbConfig";
import { Server } from "socket.io";

declare global {
  var io: Server;
}

process.on("uncaughtException", (error: Error) => {
  console.log("UncaughtException shutting down...");
  console.log(error.name, error.message);
  process.exit(1);
});

let server: http.Server;

(async () => {
  await connectToDatabase();
  const app = (await import("./src/app")).default;

  server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:5000",
        "https://e8e61abdbe2e.ngrok-free.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Example: Notify user-specific messages
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
  globalThis.io = io;

  server.listen(process.env.PORT!, () => {
    console.log(`server is running on port ${process.env.PORT}`);
  });
})();

process.on("unhandledRejection", (error: unknown) => {
  if (error instanceof Error) {
    console.log("Unhandled Rejection shutting down...");
    console.log(error.name, error.message);
  } else console.log(error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("💣❌SIGTERM received, shutting down...");
  if (server) {
    server.close(() => {
      console.log("💣❌Process terminated!");
    });
  }
});
