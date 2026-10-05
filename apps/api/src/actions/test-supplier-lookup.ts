import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: "apps/api/.env",
});

import Supplier from "../models/Supplier.js";

async function main() {
  try {
    console.log("🔌 Connecting to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is not defined"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "✅ MongoDB connected successfully\n"
    );

    const suppliers = await Supplier.find({})
      .lean();

    console.log(
      `📦 Found ${suppliers.length} supplier(s)\n`
    );

    for (const supplier of suppliers) {
      console.log(
        JSON.stringify(
          supplier,
          null,
          2
        )
      );

      console.log(
        "----------------------------------------"
      );
    }
  } catch (error) {
    console.error(
      "❌ Supplier lookup failed:",
      error
    );
  } finally {
    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.disconnect();
    }

    console.log(
      "🔌 MongoDB disconnected"
    );
  }
}

main();