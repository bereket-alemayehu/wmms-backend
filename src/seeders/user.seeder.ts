import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectToDatabase from "../config/dbConfig";
import User from "../models/user.model";
import Office from "../models/office.model";
dotenv.config();

// Default password for all seeded users
const DEFAULT_PASSWORD = "Password123";


export const seedUsers = async (): Promise<void> => {
  try {
    await connectToDatabase();

    // Get offices for staff assignment
    const offices = await Office.find({});
    if (offices.length === 0) {
      throw new Error("No offices found. Please seed offices first.");
    }

    const boleOffice = offices.find((o) => o.branchName === "Bole Branch");
    const kazanchisOffice = offices.find((o) => o.branchName === "Kazanchis Branch");
    const megenagnaOffice = offices.find((o) => o.branchName === "Megenagna Branch");

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log("🗑️  Cleared existing users");

    // Note: Passwords will be hashed before inserting (insertMany bypasses pre-save hooks)
    // passwordConfirm is not needed for seeding

    // Customers (no officeId required)
    const customers = [
      {
        fullName: "Abebe Kebede",
        phoneNumber: "+251912345678",
        email: "estifk2@gmail.com",
        serviceNumber: "WMMS-CUST-100001",
        role: "customer",
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Tigist Haile",
        phoneNumber: "+251923456789",
        email: "estifanosk3@gmail.com",
        serviceNumber: "WMMS-CUST-100002",
        role: "customer",
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Dawit Gebru",
        phoneNumber: "+251934567890",
        email: "bereketalemayehuf@gmail.com",
        serviceNumber: "WMMS-CUST-100003",
        role: "customer",
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Meron Tadesse",
        phoneNumber: "+251945678901",
        email: "bereketalemayehuf@gmail.com",
        serviceNumber: "WMMS-CUST-100004",
        role: "customer",
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Solomon Alemu",
        phoneNumber: "+251956789012",
        email: "bereketalemayehuf@gmail.com",
        serviceNumber: "WMMS-CUST-100005",
        role: "customer",
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
    ];

    // Technicians (need officeId)
    const technicians = [
      {
        fullName: "Tech User One",
        phoneNumber: "+251966666666",
        email: "tech1@example.com",
        serviceNumber: "WMMS-TECH-000001",
        role: "technician",
        officeId: boleOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Tech User Two",
        phoneNumber: "+251977777777",
        email: "tech2@example.com",
        serviceNumber: "WMMS-TECH-000002",
        role: "technician",
        officeId: boleOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Tech User Three",
        phoneNumber: "+251988888888",
        email: "tech3@example.com",
        serviceNumber: "WMMS-TECH-000003",
        role: "technician",
        officeId: kazanchisOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Tech User Four",
        phoneNumber: "+251999999999",
        email: "tech4@example.com",
        serviceNumber: "WMMS-TECH-000004",
        role: "technician",
        officeId: megenagnaOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
    ];

    // Supervisors (need officeId)
    const supervisors = [
      {
        fullName: "Supervisor One",
        phoneNumber: "+251900000001",
        email: "supervisor1@example.com",
        serviceNumber: "WMMS-SUP-000001",
        role: "supervisor",
        officeId: boleOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
      {
        fullName: "Supervisor Two",
        phoneNumber: "+251900000002",
        email: "supervisor2@example.com",
        serviceNumber: "WMMS-SUP-000002",
        role: "supervisor",
        officeId: kazanchisOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
    ];

    // Managers (need officeId)
    const managers = [
      {
        fullName: "Manager One",
        phoneNumber: "+251900000010",
        email: "manager1@example.com",
        serviceNumber: "WMMS-MAN-000001",
        role: "manager",
        officeId: boleOffice?._id,
        password: DEFAULT_PASSWORD,
        isRegistrationComplete: true,
        otpVerified: true,
        active: true,
      },
    ];

    // Insert users
    const allUsers = [...customers, ...technicians, ...supervisors, ...managers];

    // Check for existing users and skip them
    const existingUsers = await User.find({
      serviceNumber: { $in: allUsers.map((u) => u.serviceNumber) },
    });

    const existingServiceNumbers = new Set(
      existingUsers.map((u) => u.serviceNumber)
    );

    const usersToInsert = allUsers.filter(
      (u) => !existingServiceNumbers.has(u.serviceNumber)
    );

    if (usersToInsert.length === 0) {
      console.log("ℹ️  All users already exist. Skipping user seeding.");
      return;
    }

    // Hash passwords before inserting (insertMany bypasses pre-save hooks)
    const usersWithHashedPasswords = await Promise.all(
      usersToInsert.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword,
          // passwordConfirm is NOT stored in DB - only used for validation during registration
        };
      })
    );

    // Insert directly to MongoDB collection to bypass Mongoose validation
    // This avoids passwordConfirm requirement since we've already hashed passwords
    const result = await User.collection.insertMany(usersWithHashedPasswords, {
      ordered: false, // Continue inserting even if one fails
    });

    // Fetch the created users to return them
    const createdUsers = await User.find({
      _id: { $in: Object.values(result.insertedIds) },
    });

    console.log(`✅ Created ${createdUsers.length} users`);
    console.log(`   - ${customers.filter((u) => !existingServiceNumbers.has(u.serviceNumber)).length} customers`);
    console.log(`   - ${technicians.filter((u) => !existingServiceNumbers.has(u.serviceNumber)).length} technicians`);
    console.log(`   - ${supervisors.filter((u) => !existingServiceNumbers.has(u.serviceNumber)).length} supervisors`);
    console.log(`   - ${managers.filter((u) => !existingServiceNumbers.has(u.serviceNumber)).length} managers`);

    // Log user credentials for reference
    console.log("\n📋 User Credentials (Password for all: StrongPassword123):");
    createdUsers.forEach((user) => {
      console.log(`   - ${user.fullName} (${user.role}): ${user.serviceNumber}`);
    });

    return;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};

// Run seeder if executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("✅ User seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ User seeding failed:", error);
      process.exit(1);
    });
}

