import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

import { extractTextFromFile } from "./document.extractor.js";

async function main() {
  try {
    const filePath =
      process.argv[2];

    if (!filePath) {
      console.error(
        "❌ Please provide a file path."
      );

      console.log(
        "Example:"
      );

      console.log(
        'npx tsx apps/api/src/rag/test-extractor.ts "C:\\Users\\obedr\\Downloads\\policy.pdf"'
      );

      process.exit(1);
    }

    console.log(
      "📄 Reading:",
      filePath
    );

    const text =
      await extractTextFromFile(
        filePath
      );

    console.log(
      "\n✅ Text extracted successfully"
    );

    console.log(
      "📐 Characters:",
      text.length
    );

    console.log(
      "\n----- EXTRACTED TEXT -----\n"
    );

    console.log(text);

    console.log(
      "\n---------------------------"
    );
  } catch (error) {
    console.error(
      "❌ Extraction failed:",
      error
    );

    process.exitCode = 1;
  }
}

main();