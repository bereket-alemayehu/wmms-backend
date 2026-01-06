import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { IUser, UserRole } from "../interfaces/user.interface";

const userSchema = new mongoose.Schema(
  {
    // Common Fields
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Optional field, but unique if provided
    },
    role: {
      type: String,
      enum: ["customer", "supervisor", "manager", "technician"] as UserRole[],
      default: "customer",
    },

    // Primary Authentication Identifier
    serviceNumber: {
      type: String,
      required: [true, "Service number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Password Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Don't return password in queries by default
    },
    passwordConfirm: {
      type: String,
      required: [
        function (this: any) {
          return this.isModified("password");
        },
        "Please confirm your password",
      ],
      validate: {
        // Only works on CREATE and SAVE
        validator: function (this: any, el: string): boolean {
          return el === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Token Management
    refreshToken: {
      type: String,
      select: false,
    },

    // Account Security
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // Specific to Staff (Supervisor/Technician)
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
    },

    // For Simulated Auth (keeping for backward compatibility)
    otp: {
      code: String,
      expiresAt: Date,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    isRegistrationComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Note: Indexes are created automatically by unique: true and sparse: true
// No need to define them explicitly with schema.index()

// MIDDLEWARE: Hash password before saving

userSchema.pre("save", async function () {
  // Only run if password was modified
  if (!this.isModified("password")) return;

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field (not needed in DB)
  (this as any).passwordConfirm = undefined;
});

// MIDDLEWARE: Update passwordChangedAt when password is changed
userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  // Subtract 1 second to ensure token is created after password change
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

// MIDDLEWARE: Exclude inactive users from queries
userSchema.pre(/^find/, function () {
  // 'this' points to the current query
  (this as any).find({ active: { $ne: false } });
});

// INSTANCE METHOD: Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// INSTANCE METHOD: Check if password changed after JWT was issued
userSchema.methods.passwordChangedAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means password not changed
  return false;
};

// INSTANCE METHOD: Create password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and store in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration (10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Return plain text token (to be sent to user)
  return resetToken;
};

// INSTANCE METHOD: Increment login attempts
userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  // Otherwise increment attempts
  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts (lock for 1 hour)
  if (this.loginAttempts + 1 >= 5 && !this.accountLocked) {
    updates.$set = {
      accountLocked: true,
      lockUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };
  }

  await this.updateOne(updates);
};

// INSTANCE METHOD: Reset login attempts
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $set: { loginAttempts: 0, accountLocked: false },
    $unset: { lockUntil: 1 },
  });
};

// INSTANCE METHOD: Generate OTP for signup/password reset
userSchema.methods.generateOTP = function (): string {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiration
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  };

  this.otpVerified = false;

  return otp;
};

// INSTANCE METHOD: Verify OTP
userSchema.methods.verifyOTP = function (candidateOTP: string): boolean {
  // Check if OTP exists
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }

  // Check if OTP has expired
  if (this.otp.expiresAt < new Date()) {
    return false;
  }

  // Check if OTP matches
  return this.otp.code === candidateOTP;
};

// INSTANCE METHOD: Clear OTP after successful verification
userSchema.methods.clearOTP = function (): void {
  this.otp = {
    code: undefined,
    expiresAt: undefined,
  };
  this.otpVerified = true;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
