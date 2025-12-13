import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser, UserRole } from "../interfaces/user.interface";

const userSchema: Schema = new mongoose.Schema(
  {
    // Common Fields
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["customer", "supervisor", "manager", "technician"] as UserRole[],
      default: "customer",
    },

    // Specific to Customer
    serviceNumber: {
      type: String,
      unique: true,
      sparse: true, // Only required for customers
    },

    // Specific to Staff (Supervisor/Technician)
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
    },

    // For Simulated Auth
    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
