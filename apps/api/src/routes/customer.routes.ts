import { Router } from "express";

import Customer from "../models/Customer.js";

const router = Router();

/**
 * GET /api/customers
 * Get all customers
 */
router.get("/", async (_req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
});

/**
 * GET /api/customers/:id
 * Get one customer
 */
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Failed to fetch customer:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
});

/**
 * POST /api/customers
 * Create customer
 */
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Failed to create customer:", error);

    res.status(400).json({
      success: false,
      message: "Failed to create customer",
    });
  }
});

export default router;