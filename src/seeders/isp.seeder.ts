import dotenv from "dotenv";
import connectToDatabase from "../config/dbConfig";
import IspData from "../models/isp.model";

dotenv.config();

const ispCustomers = [
    {
        serviceNumber: "WMMS-CUST-100001",
        phoneNumber: "+251912345678",
        email: "estifk2@gmail.com",
        fullName: "Abebe Kebede",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100002",
        phoneNumber: "+251923456789",
        email: "estifanosk3@gmail.com",
        fullName: "Tigist Haile",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100003",
        phoneNumber: "+251934567890",
        email: "bereketalemayehuf@gmail.com",
        fullName: "Dawit Gebru",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "prepaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100071",
        phoneNumber: "+251942345668",
        email: "estifk2@gmail.com",
        fullName: "Abebe Kebede",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196e",
    },
    {
        serviceNumber: "WMMS-CUST-100004",
        phoneNumber: "+251955678901",
        email: "bereketalemayehuf@gmail.com",
        fullName: "Meron Tadesse",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100005",
        phoneNumber: "+251966789012",
        email: "stephen@example.com",
        fullName: "Stephen Test",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100006",
        phoneNumber: "+251966789013",
        email: "user6@example.com",
        fullName: "User Six",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100014",
        phoneNumber: "+251955678901",
        email: "estifk3@gmail.com",
        fullName: "Meron Tadesse",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
    {
        serviceNumber: "WMMS-CUST-100088",
        phoneNumber: "+2519567895412",
        email: "estifk2@gmail.com",
        fullName: "Solomon Alemu",
        address: "Addis Ababa, Ethiopia",
        status: "active",
        accountType: "postpaid",
        officeId: "6971e377264088569881196b",
    },
];

export const seedIspData = async (): Promise<void> => {
    try {
        await connectToDatabase();

        // Clear existing ISP data
        await IspData.deleteMany({});
        console.log("🗑️  Cleared existing ISP data");

        // Insert ISP data
        const createdIspData = await IspData.insertMany(ispCustomers);
        console.log(`✅ Created ${createdIspData.length} ISP customer records`);

        return;
    } catch (error) {
        console.error("❌ Error seeding ISP data:", error);
        throw error;
    }
};

// Run seeder if executed directly
if (require.main === module) {
    seedIspData()
        .then(() => {
            console.log("✅ ISP data seeding completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ ISP data seeding failed:", error);
            process.exit(1);
        });
}
