import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB = process.env.DATABASE;

const connectToDatabase = async () => {
  if (!DB) {
    throw new Error("DATABASE environment variable is not defined");
  }
  try {
    await mongoose.connect(DB);
    console.log(`✅ MongoDB connected successfully`);
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error);
    throw error; // Re-throw to allow proper error handling
  }
};

export default connectToDatabase;
