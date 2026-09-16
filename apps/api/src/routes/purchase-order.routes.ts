import { Router } from "express";

import Product from "../models/Product.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import StockMovement from "../models/StockMovement.js";
import Supplier from "../models/Supplier.js";
import FinanceTransaction from "../models/FinanceTransaction.js";

const router = Router();

/**
 * GET /api/purchase-orders
 * Get all purchase orders
 */
router.get("/", async (_req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Failed to fetch purchase orders:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders",
    });
  }
});

/**
 * GET /api/purchase-orders/:id
 * Get one purchase order
 */
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const {
      supplierId,
      items,
      tax = 0,
    } = req.body;

    if (
      !supplierId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "supplierId and at least one item are required",
      });

      return;
    }

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });

      return;
    }

    if (supplier.status !== "Active") {
      res.status(400).json({
        success: false,
        message: "Supplier is not active",
      });

      return;
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(
        item.productId
      );

      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });

        return;
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(
        item.unitPrice ?? product.price
      );

      if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${product.name}`,
        });

        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        res.status(400).json({
          success: false,
          message:
            `Invalid unit price for ${product.name}`,
        });

        return;
      }

      const total = quantity * unitPrice;

      subtotal += total;

      orderItems.push({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        quantity,
        unitPrice,
        total,
      });
    }

    const numericTax = Number(tax) || 0;
    const totalAmount = subtotal + numericTax;

    const orderNumber = `PO-${Date.now()}`;

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

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Failed to create purchase order:",
      error
    );

    res.status(400).json({
      success: false,
      message: "Failed to create purchase order",
    });
  }
});

/**
 * PATCH /api/purchase-orders/:id/approve
 * Approve purchase order
 */
router.patch("/:id/approve", async (req, res) => {
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
router.patch("/:id/receive", async (req, res) => {
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