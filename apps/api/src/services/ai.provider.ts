import { GoogleGenAI } from "@google/genai";

export type AIMessage = {
  role: "user" | "model";
  content: string;
};

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not defined"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function generateAIResponse(
  systemInstruction: string,
  messages: AIMessage[]
): Promise<string> {
  const contents = messages.map(
    (message) => ({
      role: message.role,
      parts: [
        {
          text: message.content,
        },
      ],
    })
  );

  const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",

  contents,

  config: {
    systemInstruction,
    temperature: 0.2,
  },
});

  return (
    response.text ||
    "I could not generate a response."
  );
}