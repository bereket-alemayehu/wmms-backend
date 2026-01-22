import mongoose from "mongoose";
import dotenv from "dotenv";
import connectToDatabase from "../config/dbConfig";
import User from "../models/user.model";

dotenv.config();

const TARGET_OFFICE_ID = "69728ae783490e8aeeb16b3b";

export const updateUserOfficeIds = async (): Promise<void> => {
  try {
    await connectToDatabase();

    // Validate that the office ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(TARGET_OFFICE_ID)) {
      throw new Error(`Invalid office ID: ${TARGET_OFFICE_ID}`);
    }

    const officeObjectId = new mongoose.Types.ObjectId(TARGET_OFFICE_ID);

    // Count users before update
    const totalUsers = await User.countDocuments({});
    console.log(`📊 Total users found: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log("ℹ️  No users found to update.");
      return;
    }

    // Update all users' officeId
    const result = await User.updateMany(
      {},
      { $set: { officeId: officeObjectId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users' officeId to ${TARGET_OFFICE_ID}`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Modified: ${result.modifiedCount} users`);

    // Verify the update
    const usersWithNewOffice = await User.countDocuments({
      officeId: officeObjectId,
    });
    console.log(`\n🔍 Verification: ${usersWithNewOffice} users now have officeId ${TARGET_OFFICE_ID}`);

    return;
  } catch (error) {
    console.error("❌ Error updating user office IDs:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

// Run seeder if executed directly
if (require.main === module) {
  updateUserOfficeIds()
    .then(() => {
      console.log("\n✅ User office ID update completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ User office ID update failed:", error);
      process.exit(1);
    });
}

