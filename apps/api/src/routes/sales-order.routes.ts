import { Router } from "express";

import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import SalesOrder from "../models/SalesOrder.js";
import StockMovement from "../models/StockMovement.js";

const router = Router();

/**
 * GET /api/sales-orders
 * Get all sales orders
 */
router.get("/", async (_req, res) => {
  try {
    const orders = await SalesOrder.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Failed to fetch sales orders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales orders",
    });
  }
});

/**
 * GET /api/sales-orders/:id
 * Get one sales order
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await SalesOrder.findById(
      req.params.id
    ).lean();

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Sales order not found",
      });

      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Failed to fetch sales order:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales order",
    });
  }
});

/**
 * POST /api/sales-orders
 * Create a sales order
 *
 * This will:
 * - Validate customer
 * - Validate products
 * - Check stock availability
 * - Reduce inventory
 * - Create OUT stock movements
 * - Update customer statistics
 */
router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      items,
      tax = 0,
    } = req.body;

    if (
      !customerId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "customerId and at least one item are required",
      });

      return;
    }

    // Find customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });

      return;
    }

    const orderItems = [];
    let subtotal = 0;

    // Validate every product first
    for (const item of items) {
      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        res.status(404).json({
          success: false,
          message:
            `Product ${item.productId} not found`,
        });

        return;
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${product.name}`,
        });

        return;
      }

      if (product.stockQuantity < quantity) {
        res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
        });

        return;
      }

      const total = product.price * quantity;

      subtotal += total;

      orderItems.push({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total,
      });
    }

    const numericTax = Number(tax) || 0;
    const totalAmount = subtotal + numericTax;

    const orderNumber = `SO-${Date.now()}`;

    // Create sales order
    const order = await SalesOrder.create({
      orderNumber,
      customer: customer._id,
      customerName: customer.companyName,
      items: orderItems,
      subtotal,
      tax: numericTax,
      totalAmount,
      status: "Confirmed",
      paymentStatus: "Pending",
    });

    /**
     * Reduce inventory and create stock movements
     */
    for (const item of orderItems) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        continue;
      }

      const previousStock = product.stockQuantity;
      const newStock =
        previousStock - item.quantity;

      // Reduce inventory
      product.stockQuantity = newStock;

      await product.save();

      // Create OUT stock movement
      await StockMovement.create({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        type: "OUT",
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: "Sales Order",
        reference: orderNumber,
      });
    }

    // Update customer statistics
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: {
        totalOrders: 1,
        totalValue: totalAmount,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Sales order created and inventory updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to create sales order:",
      error
    );

    res.status(400).json({
      success: false,
      message: "Failed to create sales order",
    });
  }
});

export default router;