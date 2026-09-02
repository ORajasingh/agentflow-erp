import { Router } from "express";

import Product from "../models/Product.js";

const router = Router();

/**
 * GET /api/products
 * Get all active products
 */
router.get("/", async (_req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });

      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

/**
 * POST /api/products
 * Create a product
 */
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Failed to create product:", error);

    res.status(400).json({
      success: false,
      message: "Failed to create product",
    });
  }
});

export default router;