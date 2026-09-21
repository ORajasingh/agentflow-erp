import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const ai = getGeminiClient();

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length === 0) {
    throw new Error(
      "Gemini returned an empty embedding"
    );
  }

  return embedding;
}

export async function testEmbedding() {
  const embedding = await generateEmbedding(
    "AgentFlow ERP procurement policy"
  );

  console.log(
    "✅ Embedding generated successfully"
  );

  console.log(
    "📐 Embedding dimension:",
    embedding.length
  );

  console.log(
    "🔢 First 5 values:",
    embedding.slice(0, 5)
  );
}