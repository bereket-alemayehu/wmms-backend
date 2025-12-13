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
  role: UserRole;

  // Specific to Customer
  serviceNumber?: string;

  // Specific to Staff (Supervisor/Technician)
  officeId?: Types.ObjectId;

  // For Simulated Auth
  otp?: IOTP;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  passwordChangedAfter: (JWTTimestamp: number) => boolean;
}
