import dotenv from "dotenv";
import { seedOffices } from "./office.seeder";
import { seedUsers } from "./user.seeder";
import { seedIspData } from "./isp.seeder";

dotenv.config();

const runSeeders = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Step 1: Seed offices first (users need office references)
    console.log("📦 Seeding offices...");
    await seedOffices();
    console.log("");

    // Step 2: Seed ISP Data
    console.log("📡 Seeding ISP customer data...");
    await seedIspData();
    console.log("");

    // Step 3: Seed users (depends on offices)
    console.log("👥 Seeding users...");
    await seedUsers();
    console.log("");

    console.log("✅ All seeders completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - Offices: 4 branches created");
    console.log("   - ISP Records: 7 customer service numbers created");
    console.log("   - Users: 5 customers, 4 technicians, 2 supervisors, 1 manager");
    console.log("\n🔑 Default password for all users: Password123");
    console.log("\n💡 You can now test the API endpoints!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run seeders
runSeeders();



