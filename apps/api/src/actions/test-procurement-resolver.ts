import dotenv from "dotenv";

dotenv.config({
  path: "apps/api/.env",
});

import { connectDatabase } from "../config/database.js";
import {
  resolvePurchaseOrder,
} from "./procurement.resolver.js";

async function main() {
  try {
    await connectDatabase();

    const result =
      await resolvePurchaseOrder(
        "Create a purchase order for 2 Dell Latitude 5450 from Dell Technologies"
      );

    console.dir(
      result,
      {
        depth: null,
      }
    );
  } catch (error) {
    console.error(
      "❌ Resolver test failed:",
      error
    );
  } finally {
    process.exit(0);
  }
}

main();