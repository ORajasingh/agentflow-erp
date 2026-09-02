import { Router } from "express";

import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

const router = Router();

/**
 * POST /api/inventory-adjustments
 *
 * Adjust inventory manually.
 *
 * Body:
 * {
 *   "productId": "...",
 *   "quantity": 5,
 *   "reason": "Physical stock correction"
 * }
 *
 * Positive quantity  -> increase stock
 * Negative quantity  -> decrease stock
 */
router.post("/", async (req, res) => {
  try {
    const {
      productId,
      quantity,
      reason,
      reference,
    } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: "productId is required",
      });

      return;
    }

    const adjustment = Number(quantity);

    if (
      !Number.isInteger(adjustment) ||
      adjustment === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "quantity must be a non-zero integer",
      });

      return;
    }

    if (!reason || String(reason).trim() === "") {
      res.status(400).json({
        success: false,
        message: "reason is required",
      });

      return;
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + adjustment;

    // Never allow negative inventory
    if (newStock < 0) {
      res.status(400).json({
        success: false,
        message:
          `Insufficient stock. Current stock: ${previousStock}`,
      });

      return;
    }

    // Update product inventory
    product.stockQuantity = newStock;

    await product.save();

    // Record adjustment
    const movement = await StockMovement.create({
      product: product._id,
      sku: product.sku,
      productName: product.name,
      type: "ADJUSTMENT",
      quantity: Math.abs(adjustment),
      previousStock,
      newStock,
      reason: String(reason).trim(),
      reference: reference
        ? String(reference).trim()
        : undefined,
    });

    res.status(201).json({
      success: true,
      message:
        "Inventory adjusted successfully",
      data: {
        product,
        movement,
      },
    });
  } catch (error) {
    console.error(
      "Failed to adjust inventory:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to adjust inventory",
    });
  }
});

export default router;