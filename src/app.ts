import { NextFunction, Request, Response, Application } from "express";
import express from "express";
import { express as useragentMiddleware } from "express-useragent";
import morogan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import userRouter from "./routes/user.routes";
import officeRouter from "./routes/office.routes";
import refundRouter from "./routes/refund.routes";
import outageRouter from "./routes/outage.routes";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./swagger";
import authRouter from "./routes/auth.routes";

import globalErrorHandler from "./controllers/error.controller";
import { sanitizeInputs } from "./middlewares/middleware";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://192.168.0.112:3000",
  "https://addisbroker.tetertechs.com",
  "https://test.addisbroker.tetertechs.com",
  "https://fc47f33dcb04.ngrok-free.app",
];

const app: Application = express();
app.set("trust proxy", 1);
app.use(useragentMiddleware()); // Required for parsing user-agent

app.use(morogan("dev"));
// app.use('/images/', express.static(process.env.UPLOAD_DIR_IMAGE!));
// app.use('/videos/', express.static(process.env.UPLOAD_DIR_VIDEO!));
// app.use('/videos', express.static(path.resolve(__dirname, '../public/videos')));

app.use(express.json());

app.options("/*path", cors()); // Enable preflight requests for all routes

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, false);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use((req: Request, res: Response, next: NextFunction) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  mongoSanitize.sanitize(req.query);
  next();
});
app.use(sanitizeInputs);
app.use(compression());

const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: "Too many request! Try again after an hour",
});

app.use(limiter);
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/offices", officeRouter);
app.use("/api/v1/refunds", refundRouter);
app.use("/api/v1/outages", outageRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl, "error");
  res.status(404).json({
    status: "fail",
    message: `Couldnot find this ${req.originalUrl} on this server`,
  });
});

app.use(globalErrorHandler);

export default app;
