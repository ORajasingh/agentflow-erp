import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({
  path: "apps/api/.env",
});

import { connectDatabase } from "../config/database.js";
import { resolvePurchaseOrder } from "./procurement.resolver.js";

async function main() {
  try {
    await connectDatabase();

    const result = await resolvePurchaseOrder(
      "Dell Latitude 5450",
      2
    );

    console.log(
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ Resolver test failed:",
      error
    );
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log(
      "🔌 MongoDB disconnected"
    );
  }
}

main();