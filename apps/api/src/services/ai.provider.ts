export type AIMessage = {
  role: "user" | "model";
  content: string;
};

const ollamaBaseUrl = (
  process.env.OLLAMA_BASE_URL || "http://localhost:11434"
).replace(/\/+$/, "");

const ollamaModel = process.env.OLLAMA_MODEL || "gemma4:e2b";

export async function generateAIResponse(
  systemInstruction: string,
  messages: AIMessage[]
): Promise<string> {
  if (messages.length === 0) {
    return "Please provide a message.";
  }

  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        ...messages.map((message) => ({
          role: message.role === "model" ? "assistant" : "user",
          content: message.content,
        })),
      ],
      stream: false,
      options: {
        temperature: 0.2,
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Ollama request failed (${response.status}): ${
        errorText || response.statusText
      }`
    );
  }

  const result = (await response.json()) as {
    message?: { content?: string };
  };

  const content = result.message?.content?.trim();

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}