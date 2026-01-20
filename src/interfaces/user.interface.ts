import { Document, Types } from "mongoose";

export type UserRole = "customer" | "supervisor" | "manager" | "technician";

export interface IOTP {
  code?: string;
  expiresAt?: Date;
}

export interface IUser extends Document {
  // Common Fields
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;

  // Primary Authentication Identifier
  serviceNumber: string;

  // Password Authentication
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Token Management
  refreshToken?: string;

  // Account Security
  active: boolean;

  // Specific to Customer (no longer needed as primary identifier)
  // serviceNumber is now for all users

  // Specific to Staff (Supervisor/Technician)
  officeId?: Types.ObjectId;

  // For Simulated Auth (backward compatibility)
  otp?: IOTP;
  otpVerified: boolean;
  isRegistrationComplete: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  passwordChangedAfter: (JWTTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
  generateOTP: () => string;
  verifyOTP: (candidateOTP: string) => boolean;
  clearOTP: () => void;
}
