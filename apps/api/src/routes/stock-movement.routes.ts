import { Router } from "express";

import StockMovement from "../models/StockMovement.js";

const router = Router();

/**
 * GET /api/stock-movements
 * Get all stock movements
 */
router.get("/", async (_req, res) => {
  try {
    const movements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(
      "Failed to fetch stock movements:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
});

/**
 * GET /api/stock-movements/product/:productId
 * Get stock movements for one product
 */
router.get(
  "/product/:productId",
  async (req, res) => {
    try {
      const movements =
        await StockMovement.find({
          product: req.params.productId,
        })
          .sort({ createdAt: -1 })
          .lean();

      res.json({
        success: true,
        count: movements.length,
        data: movements,
      });
    } catch (error) {
      console.error(
        "Failed to fetch product stock movements:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch product stock movements",
      });
    }
  }
);

export default router;