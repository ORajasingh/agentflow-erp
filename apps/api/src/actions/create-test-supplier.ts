import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: "apps/api/.env",
});

import Supplier from "../models/Supplier.js";

async function main() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI!
    );

    console.log(
      "✅ MongoDB connected"
    );

    const existing =
      await Supplier.findOne({
        companyName: "Dell Technologies",
      });

    if (existing) {
      console.log(
        "ℹ️ Dell Technologies already exists"
      );

      console.log(
        existing.toObject()
      );

      return;
    }

    const supplier =
      await Supplier.create({
        supplierId: `SUP-${Date.now()}`,
        companyName:
          "Dell Technologies",
        contactPerson:
          "Dell Sales",
        email:
          "sales@dell.com",
        phone:
          "",
        category:
          "Laptops",
        address:
          "",
        city:
          "",
        country:
          "India",
        rating: 5,
        totalOrders: 0,
        totalPurchaseValue: 0,
        status:
          "Active",
      });

    console.log(
      "✅ Dell Technologies supplier created"
    );

    console.log(
      supplier.toObject()
    );
  } catch (error) {
    console.error(
      "❌ Failed:",
      error
    );
  } finally {
    await mongoose.disconnect();

    console.log(
      "🔌 MongoDB disconnected"
    );
  }
}

main();