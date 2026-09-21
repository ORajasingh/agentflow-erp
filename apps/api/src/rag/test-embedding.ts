import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

console.log(
  "ENV path:",
  path.resolve(
    process.cwd(),
    "apps/api/.env"
  )
);

console.log(
  "Gemini key loaded:",
  Boolean(process.env.GEMINI_API_KEY)
);

async function main() {
  try {
    const { testEmbedding } = await import(
      "./embeddings.js"
    );

    await testEmbedding();

    console.log(
      "✅ Embedding test completed"
    );
  } catch (error) {
    console.error(
      "❌ Embedding test failed:",
      error
    );

    process.exit(1);
  }
}

main();