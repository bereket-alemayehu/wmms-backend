import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./src/app";

dotenv.config();

const PORT = process.env.PORT || 3000;

// MongoDB connection string
const MONGO_URI: string =
  process.env.MONGODB_URI ||
  "mongodb+srv://wmms-admin:wmms-admin@wmms.ek1cijz.mongodb.net/wmms?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Start the server
app.listen(PORT, () => {
  console.log(
    `🚀 Server is running on https://wifi-maintenance-system-wmms-backend.onrender.com`
  );
});

