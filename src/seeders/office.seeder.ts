import mongoose from "mongoose";
import dotenv from "dotenv";
import connectToDatabase from "../config/dbConfig";
import Office from "../models/office.model";

dotenv.config();

const offices = [
  {
    cityName: "Addis Ababa",
    branchName: "Bole Branch",
    location: "Bole Sub-city, Near Bole Airport",
    activeTechniciansCount: 8,
  },
  {
    cityName: "Addis Ababa",
    branchName: "Kazanchis Branch",
    location: "Kazanchis, Near UNECA",
    activeTechniciansCount: 6,
  },
  {
    cityName: "Addis Ababa",
    branchName: "Megenagna Branch",
    location: "Megenagna, Near CMC",
    activeTechniciansCount: 5,
  },
  {
    cityName: "Addis Ababa",
    branchName: "Piassa Branch",
    location: "Piassa, City Center",
    activeTechniciansCount: 4,
  },
];

export const seedOffices = async (): Promise<void> => {
  try {
    await connectToDatabase();

    // Clear existing offices
    await Office.deleteMany({});
    console.log("🗑️  Cleared existing offices");

    // Insert offices
    const createdOffices = await Office.insertMany(offices);
    console.log(`✅ Created ${createdOffices.length} offices`);

    // Log office IDs for reference
    createdOffices.forEach((office) => {
      console.log(`   - ${office.branchName} (ID: ${office._id})`);
    });

    return;
  } catch (error) {
    console.error("❌ Error seeding offices:", error);
    throw error;
  }
};

// Run seeder if executed directly
if (require.main === module) {
  seedOffices()
    .then(() => {
      console.log("✅ Office seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Office seeding failed:", error);
      process.exit(1);
    });
}



