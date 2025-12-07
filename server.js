const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

// MongoDB connection string
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://wmms-admin:wmms-admin@wmms.ek1cijz.mongodb.net/wmms?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Start the server
app.listen(PORT, () => {
  console.log(
    `🚀 Server is running on https://wifi-maintenance-system-wmms-backend.onrender.com`
  );
});
