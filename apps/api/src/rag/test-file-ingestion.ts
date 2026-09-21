import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

import { ingestFile } from "../services/rag/rag.service.js";

async function main() {
  try {
    const filePath =
      process.argv[2];

    if (!filePath) {
      console.error(
        "❌ Please provide a PDF/DOCX/TXT file path."
      );

      console.log(
        'Example: npx tsx apps/api/src/rag/test-file-ingestion.ts "C:\\Users\\obedr\\Downloads\\policy.pdf"'
      );

      process.exit(1);
    }

    console.log("📄 File:", filePath);

    // Connect MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI!
    );

    console.log("✅ MongoDB connected");

    const result =
      await ingestFile(
        filePath,
        path.basename(filePath),
        filePath,
        {
          uploadedBy: "test",
          type: path
            .extname(filePath)
            .toLowerCase(),
        }
      );

    console.log(
      "\n✅ Document ingested successfully"
    );

    console.log(result);

    await mongoose.disconnect();

    console.log(
      "✅ MongoDB disconnected"
    );
  } catch (error) {
    console.error(
      "\n❌ File ingestion failed:",
      error
    );

    await mongoose.disconnect();

    process.exit(1);
  }
}

main();