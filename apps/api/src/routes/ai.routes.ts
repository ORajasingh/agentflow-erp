import { Router } from "express";
import { getERPContext } from "../services/ai.service.js";

const router = Router();

/**
 * GET /api/ai/context
 * Get ERP data for the AI system
 */
router.get("/context", async (_req, res) => {
  try {
    const context = await getERPContext();

    res.json({
      success: true,
      data: context,
    });
  } catch (error) {
    console.error(
      "Failed to load AI ERP context:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load ERP context",
    });
  }
});

export default router;