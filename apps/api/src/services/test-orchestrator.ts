import dotenv from "dotenv";

dotenv.config({
  path: "apps/api/.env",
});

import { connectDatabase } from "../config/database.js";
import { orchestrate } from "./ai.orchestrator.js";

async function main() {
  try {
    await connectDatabase();

    console.log("\n========== TEST 1 ==========\n");

    const purchaseResult = await orchestrate(
      "Create a purchase order for 2 laptops"
    );

    console.dir(purchaseResult, {
      depth: null,
    });

    console.log("\n========== TEST 2 ==========\n");

    const inventoryResult = await orchestrate(
      "Which products are running low?"
    );

    console.dir(inventoryResult, {
      depth: null,
    });

    console.log("\n✅ Orchestrator test completed");
  } catch (error) {
    console.error(
      "\n❌ Orchestrator test failed:"
    );

    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();