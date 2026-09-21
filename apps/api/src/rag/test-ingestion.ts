import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

import mongoose from "mongoose";
import { ingestDocument } from "../services/rag/rag.service.js";

async function main() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI as string
    );

    console.log("✅ MongoDB connected");

    const result = await ingestDocument(
      "Procurement Policy",
      "test-procurement-policy",
      `
Purchase orders above ₹50,000 require manager approval.

Only active suppliers can receive purchase orders.

Products below their reorder level should be replenished.

Purchase orders must be approved before they are marked as ordered.

Received purchase orders increase the inventory stock quantity.

When goods are received, a finance purchase transaction is created.
      `,
      {
        type: "policy",
        department: "procurement",
      }
    );

    console.log(
      "✅ Document ingested successfully"
    );

    console.log(result);
  } catch (error) {
    console.error(
      "❌ Ingestion failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();