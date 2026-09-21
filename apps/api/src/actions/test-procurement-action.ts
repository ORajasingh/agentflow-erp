import dotenv from "dotenv";

dotenv.config({
  path: "apps/api/.env",
});
import { connectDatabase } from "../config/database.js";
import { createPurchaseOrder } from "./procurement.action.js";

async function main() {
  try {
    await connectDatabase();

    // Replace these with real IDs from your MongoDB data.
    const supplierId = "6a97adfc22d33ab9bfca7a9a";
    const productId = "6a97c128e8aa68073010e30c";

    const result = await createPurchaseOrder({
      supplierId,

      items: [
        {
          productId,
          quantity: 2,
        },
      ],

      tax: 0,
    });

    console.log(
      "✅ Purchase order created:"
    );

    console.dir(result, {
      depth: null,
    });

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Procurement action failed:"
    );

    console.error(error);

    process.exit(1);
  }
}

main();