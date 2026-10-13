import { Router } from "express";

import Product from "../models/Product.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import FinanceTransaction from "../models/FinanceTransaction.js";
import mongoose from "mongoose";
import {
  authenticateToken,
  requireRole,
} from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/purchase-orders
 * Get all purchase orders
 */
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }catch (error) {
  console.error("Failed to create purchase order:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to create purchase order.",
  });
}
});

/**
 * GET /api/purchase-orders/:id
 * Get one purchase order
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(
      req.params.id
    ).lean();

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });

      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to fetch purchase order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order",
    });
  }
});

/**
 * POST /api/purchase-orders
 * Create purchase order
 */

/**
 * POST /api/purchase-orders
 * Create a purchase order using server-validated data.
 */

router.post(
  "/",
  authenticateToken,
  requireRole("admin", "manager"),
  async (req, res) => {

  try {
    const { supplierId, items, tax = 0 } = req.body;

    // 1. Validate the request
    if (
      typeof supplierId !== "string" ||
      !supplierId.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "A valid supplierId and at least one item are required.",
      });
      return;
    }

    if (items.length > 100) {
      res.status(400).json({
        success: false,
        message: "A purchase order cannot contain more than 100 items.",
      });
      return;
    }

    const numericTax = Number(tax);

    if (
      !Number.isFinite(numericTax) ||
      numericTax < 0 ||
      numericTax > 1_000_000_000
    ) {
      res.status(400).json({
        success: false,
        message: "Tax must be a valid non-negative amount.",
      });
      return;
    }

    // 2. Validate the supplier ID before querying MongoDB
    if (!mongoose.isValidObjectId(supplierId)) {
      res.status(400).json({
        success: false,
        message: "Invalid supplier ID.",
      });
      return;
    }

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
      return;
    }

    if (supplier.status !== "Active") {
      res.status(400).json({
        success: false,
        message: "Supplier is not active.",
      });
      return;
    }

    // 3. Validate every item before creating the order
    const orderItems = [];
    const seenProductIds = new Set<string>();
    let subtotal = 0;

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId)
      ) {
        res.status(400).json({
          success: false,
          message: "Every item must have a valid product ID.",
        });
        return;
      }

      if (seenProductIds.has(item.productId)) {
        res.status(400).json({
          success: false,
          message:
            "Duplicate products are not allowed. Combine their quantities into one item.",
        });
        return;
      }

      seenProductIds.add(item.productId);

      const product = await Product.findById(item.productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found.`,
        });
        return;
      }

      if (product.isActive === false) {
        res.status(400).json({
          success: false,
          message: `Product ${product.name} is inactive.`,
        });
        return;
      }

      // Product.supplier stores a supplier name, not a MongoDB ID.
      const productSupplier = product.supplier?.trim().toLowerCase();
      const selectedSupplier = supplier.companyName.trim().toLowerCase();

      if (
        !productSupplier ||
        productSupplier !== selectedSupplier
      ) {
        res.status(400).json({
          success: false,
          message:
            `Supplier mismatch for ${product.name}. ` +
            `Product supplier: ${product.supplier || "not assigned"}; ` +
            `selected supplier: ${supplier.companyName}. ` +
            "Correct the product's supplier assignment before ordering.",
        });
        return;
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        quantity > 1_000_000
      ) {
        res.status(400).json({
          success: false,
          message:
            `Quantity for ${product.name} must be a positive whole number.`,
        });
        return;
      }

      // Never trust a purchase price submitted by the frontend.
      const unitPrice = Number(product.costPrice);

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            `A valid positive procurement cost is required for ${product.name}.`,
        });
        return;
      }

      const total = quantity * unitPrice;

      if (
        !Number.isFinite(total) ||
        total > 1_000_000_000
      ) {
        res.status(400).json({
          success: false,
          message: `Invalid line total for ${product.name}.`,
        });
        return;
      }

      subtotal += total;

      if (!Number.isFinite(subtotal) || subtotal > 1_000_000_000) {
        res.status(400).json({
          success: false,
          message: "Purchase subtotal exceeds the allowed limit.",
        });
        return;
      }

      orderItems.push({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        quantity,
        unitPrice,
        total,
      });
    }

    // 4. Calculate the final amount on the backend
    const totalAmount = subtotal + numericTax;

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount > 1_000_000_000
    ) {
      res.status(400).json({
        success: false,
        message: "Purchase order total is invalid or too large.",
      });
      return;
    }

    // 5. Generate an order number and save as Pending.
    // The approval route must enforce authorization separately.
    const orderNumber =
      `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const order = await PurchaseOrder.create({
      orderNumber,
      supplier: supplier._id,
      supplierName: supplier.companyName,
      items: orderItems,
      subtotal,
      tax: numericTax,
      totalAmount,
      status: "Pending",
      paymentStatus: "Pending",
    });

    const requiresApproval = totalAmount > 50_000;

    res.status(201).json({
      success: true,
      message: requiresApproval
        ? `Purchase order ${order.orderNumber} was created as Pending. Manager approval is required because the total exceeds ₹50,000.`
        : `Purchase order ${order.orderNumber} was created successfully and is Pending approval.`,
      requiresApproval,
      data: order,
    });
  } catch (error) {
    console.error("Failed to create purchase order:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create purchase order.",
    });
  }
});

/**
 * PATCH /api/purchase-orders/:id/approve
 * Approve purchase order
 */
router.patch(
  "/:id/approve",
  authenticateToken,
  requireRole("admin", "manager"),
  async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });

      return;
    }

    if (order.status !== "Pending") {
      res.status(400).json({
        success: false,
        message:
          "Only pending purchase orders can be approved",
      });

      return;
    }

    order.status = "Approved";

    await order.save();

    res.json({
      success: true,
      message: "Purchase order approved",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to approve purchase order:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to approve purchase order",
    });
  }
});

/**
 * PATCH /api/purchase-orders/:id/order
 * Mark purchase order as ordered
 */
router.patch("/:id/order", async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });

      return;
    }

    if (order.status !== "Approved") {
      res.status(400).json({
        success: false,
        message:
          "Purchase order must be approved before ordering",
      });

      return;
    }

    order.status = "Ordered";

    await order.save();

    res.json({
      success: true,
      message: "Purchase order marked as ordered",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to mark purchase order as ordered:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to mark purchase order as ordered",
    });
  }
});

/**
 * PATCH /api/purchase-orders/:id/receive
 *
 * Receive goods:
 * - Purchase order becomes Received
 * - Inventory increases
 * - Supplier statistics update
 */
router.patch(
  "/:id/receive",
  authenticateToken,
  requireRole("admin", "manager"),
  async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });

      return;
    }

    // Prevent duplicate receiving
    if (order.status === "Received") {
      res.status(400).json({
        success: false,
        message:
          "This purchase order has already been received",
      });

      return;
    }

    // Only approved or ordered orders can be received
    if (
      order.status !== "Approved" &&
      order.status !== "Ordered"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Only approved or ordered purchase orders can be received",
      });

      return;
    }

    /**
     * Process every product
     */
    for (const item of order.items) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        res.status(404).json({
          success: false,
          message:
            `Product ${item.productName} not found`,
        });

        return;
      }

      const previousStock =
        product.stockQuantity;

      const newStock =
        previousStock + item.quantity;

      // Update inventory
      product.stockQuantity = newStock;

      await product.save();

      // Create stock movement
      await StockMovement.create({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        type: "IN",
        quantity: item.quantity,
        previousStock,
        newStock,
        reason: "Purchase Order Received",
        reference: order.orderNumber,
      });
    }

    // Update supplier statistics
    await Supplier.findByIdAndUpdate(
      order.supplier,
      {
        $inc: {
          totalOrders: 1,
          totalPurchaseValue:
            order.totalAmount,
        },
      }
    );

    // Create finance expense transaction
await FinanceTransaction.create({
  transactionId: `TXN-${Date.now()}-${Math.floor(
    Math.random() * 1000
  )}`,

  type: "Expense",

  category: "Purchase",

  description: `Purchase order ${order.orderNumber} - ${order.supplierName}`,

  amount: order.totalAmount,

  reference: order.orderNumber,

  relatedOrder: order._id,

  paymentStatus: order.paymentStatus,

  transactionDate: new Date(),
});

    // Mark PO as received
    order.status = "Received";

    await order.save();

    res.json({
      success: true,
      message:
        "Purchase order received, inventory updated, and stock movements created",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to receive purchase order:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to receive purchase order",
    });
  }
});

export default router;