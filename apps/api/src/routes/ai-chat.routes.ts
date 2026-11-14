
import { Router, type Request, type Response } from "express";
import AIConversation from "../models/AIConversation";
import { orchestrate } from "../services/ai.orchestrator";
import { generateAIResponse } from "../services/ai.provider";

const router = Router();

const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{8,100}$/;

function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && SESSION_ID_REGEX.test(value);
}

/**
 * GET /api/ai/chat?sessionId=<id>
 * Load a conversation saved in MongoDB.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId;

    if (!isValidSessionId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "A valid sessionId is required.",
      });
    }

    const conversation = await AIConversation.findOne({
      sessionId,
    }).lean();

    const messages = (conversation?.messages ?? []).map((item) => ({
      role: item.role === "model" ? "assistant" : "user",
      content: item.content,
      createdAt: item.createdAt,
    }));

    return res.json({
      success: true,
      data: { sessionId, messages },
    });
  } catch (error) {
    console.error("Conversation history loading failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load conversation history.",
    });
  }
});

/**
 * POST /api/ai/chat
 * Save the user's message, generate a response, and save the response.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, sessionId, history } = req.body as {
      message?: unknown;
      sessionId?: unknown;
      history?: unknown;
    };

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 30000
    ) {
      return res.status(400).json({
        success: false,
        message: "Message must contain between 1 and 30000 characters.",
      });
    }

    if (!isValidSessionId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "A valid sessionId is required.",
      });
    }

    // Create the conversation if it does not exist.
    await AIConversation.updateOne(
      { sessionId },
      { $setOnInsert: { sessionId, messages: [] } },
      { upsert: true }
    );

    const conversation = await AIConversation.findOne({ sessionId });

    if (!conversation) {
      throw new Error("Could not initialize the conversation.");
    }

    // Use the persisted history as the source of truth.
    const previousMessages = conversation.messages
      .slice(-10)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    // Save the incoming user message before generating the response.
    conversation.messages.push({
      role: "user",
      content: message.trim(),
      createdAt: new Date(),
    });

    await conversation.save();

    const orchestration = await orchestrate(message.trim(), sessionId);

    // Retain the existing RAG integration in your project.
    const rag: unknown[] = [];

    const systemInstruction = [
      "You are Gideon, the AgentFlow ERP business assistant.",
      "Use the supplied ERP data and retrieved documents when relevant.",
      "Never claim an action succeeded unless the backend confirms it.",
      "For purchase orders, require explicit user confirmation.",
      rag?.length
        ? `Relevant retrieved documents:\n${JSON.stringify(rag)}`
        : "",
      orchestration?.data
        ? `ERP agent data:\n${JSON.stringify(orchestration.data)}`
        : "",
      orchestration?.actionResult
        ? `Action result:\n${JSON.stringify(orchestration.actionResult)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

 const aiMessages = [
  ...previousMessages,
  { role: "user" as const, content: message.trim() },
];

const answer = await generateAIResponse(
  systemInstruction,
  aiMessages.map((item) => ({
    role: item.role,
    content: item.content,
  }))
);
    // Persist the assistant's answer.
    conversation.messages.push({
      role: "model",
      content: answer,
      createdAt: new Date(),
    });

    await conversation.save();

    return res.json({
      success: true,
      data: {
        message: answer,
        agent: orchestration.agent,
        agentData: orchestration.data,
        actionResult: orchestration.actionResult,
        sessionId,
        rag,
      },
    });
  } catch (error) {
    console.error("AI chat request failed:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "AI chat request failed.",
    });
  }
});

export default router;
