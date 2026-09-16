import { Router } from "express";

import {
  generateAIResponse,
  AIMessage,
} from "../services/ai.provider.js";

import {
  orchestrate,
} from "../services/ai.orchestrator.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      message,
      history = [],
    } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Message is required",
      });

      return;
    }

    // Run the AI orchestrator.
    // This selects and executes the appropriate ERP agent.
    const orchestration =
      await orchestrate(message.trim());

    const agentData = orchestration.data
      ? JSON.stringify(
          orchestration.data,
          null,
          2
        )
      : "No specialized agent data was required.";

    const systemInstruction = `
You are Gideon, the AI business assistant
for AgentFlow Enterprise OS.

The AI Orchestrator has ALREADY selected and
executed the appropriate specialized ERP agent.

Selected agent:
${orchestration.agent}

Agent result:
${agentData}

IMPORTANT RULES:

1. The selected agent has already been executed.
2. Use the agent result immediately.
3. Never ask the user for permission to access an agent.
4. Never say you are waiting for an agent.
5. Never say you need to request an agent.
6. Never invent ERP information.
7. Never invent products, customers, suppliers,
   orders, stock quantities, or financial values.
8. If information is unavailable, clearly say so.
9. Use ₹ for Indian currency.
10. Use the actual numbers from the agent result.
11. You may provide recommendations, but clearly
    identify them as recommendations.
12. You are currently READ-ONLY.
13. Do not claim to have created, modified,
    approved, cancelled, ordered, received,
    deleted, or changed anything.
14. If the user requests an action, explain what
    would need to happen but do not execute it yet.
15. Answer directly and naturally.

Available agents:

- Inventory Agent:
  stock, products, warehouses, low stock,
  reorder analysis.

- Sales Agent:
  sales orders, revenue, best-selling products,
  customer sales.

- Finance Agent:
  income, expenses, payments, cash flow,
  financial analysis.

- Procurement Agent:
  purchase orders, suppliers, purchasing,
  procurement analysis.
`;

    const previousMessages: AIMessage[] =
      Array.isArray(history)
        ? history
            .filter(
              (item: any) =>
                (
                  item?.role === "user" ||
                  item?.role === "model"
                ) &&
                typeof item?.content === "string"
            )
            .slice(-10)
        : [];

    const messages: AIMessage[] = [
      ...previousMessages,
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const answer =
      await generateAIResponse(
        systemInstruction,
        messages
      );

    res.json({
      success: true,
      data: {
        message: answer,
        agent: orchestration.agent,
      },
    });
  } catch (error: any) {
    console.error(
      "❌ AI chat error:",
      error
    );

    console.error(
      "❌ Error message:",
      error?.message
    );

    console.error(
      "❌ Error status:",
      error?.status
    );

    console.error(
      "❌ Error response:",
      error?.response
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "AI assistant failed to process the request",
    });
  }
});

export default router;