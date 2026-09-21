import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

import { retrieveKnowledge } from "../services/rag/rag.service.js";

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined"
      );
    }

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected");

    const results =
      await retrieveKnowledge(
        "Do large purchase orders need approval?"
      );

    console.log(
      `\n🔎 Results found: ${results.length}\n`
    );

    for (const [index, result] of results.entries()) {
      console.log(`--- Result ${index + 1} ---`);
      console.log("Title:", result.title);
      console.log("Source:", result.source);
      console.log("Score:", result.score);
      console.log("Content:", result.content);
      console.log();
    }
  } catch (error) {
    console.error(
      "❌ Search failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();