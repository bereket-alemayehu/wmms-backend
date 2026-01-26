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
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5000",
        "https://e8e61abdbe2e.ngrok-free.app",
      ],
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      // Try to get token from auth object, Authorization header, or cookies
      let token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(" ")[1];
      
      // If no token in auth/header, check cookies
      if (!token || token === "null") {
        const cookieHeader = socket.handshake.headers.cookie;
        if (cookieHeader) {
          const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {});
          token = cookies.jwt;
        }
      }
      
      if (!token || token === "null") {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const { verifyToken } = await import("./src/utils/security.utils");
      const User = (await import("./src/models/user.model")).default;
      
      const decoded = await verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      (socket as any).user = user;
      next();
    } catch (error: any) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: any) => {
    const user = socket.user;
    const userRoom = `user_${user._id}`;

    // Join user-specific room for notifications
    socket.join(userRoom);
    console.log(`User ${user.fullName} (${user._id}) connected with socket ${socket.id}`);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${user.fullName} (${user._id}) disconnected`);
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
