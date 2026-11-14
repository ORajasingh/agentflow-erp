import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";

import PendingProcurement from "../models/PendingProcurement.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import {
  authenticateToken,
  requireRole,
} from "../middleware/auth.js";

const router = Router();

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{8,100}$/;
const MAX_QUANTITY = 1_000_000;
const MAX_ORDER_TOTAL = 100_000_000;

function isValidSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    SESSION_ID_PATTERN.test(value)
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

/**
 * POST /api/ai/procurement/:id/confirm
 *
 * Explicitly confirms a previously resolved AI procurement request.
 * Only authenticated admins and managers may confirm.
 */
router.post(
  "/:id/confirm",
  authenticateToken,
  requireRole("admin", "manager"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { sessionId } = req.body as {
      sessionId?: unknown;
    };

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid procurement request ID.",
      });
      return;
    }

    if (!isValidSessionId(sessionId)) {
      res.status(400).json({
        success: false,
        message: "A valid conversation session ID is required.",
      });
      return;
    }

    try {
      const existingPending =
        await PendingProcurement.findOne({
          _id: id,
          sessionId,
        });

      if (!existingPending) {
        res.status(404).json({
          success: false,
          message:
            "The pending procurement request was not found for this conversation.",
        });
        return;
      }

      // A repeated confirmation returns the same purchase order.
      if (
        existingPending.status === "completed" &&
        existingPending.purchaseOrderId
      ) {
        const existingOrder =
          await PurchaseOrder.findById(
            existingPending.purchaseOrderId
          ).lean();

        if (existingOrder) {
          res.status(200).json({
            success: true,
            message: "This procurement was already confirmed.",
            data: {
              purchaseOrder: existingOrder,
              alreadyConfirmed: true,
            },
          });
          return;
        }
      }

      if (existingPending.status === "processing") {
        // Recover safely if a previous request created the PO
        // but failed before updating the pending record.
        const existingOrder =
          await PurchaseOrder.findOne({
            pendingProcurementId: existingPending._id,
          }).lean();

        if (existingOrder) {
          await PendingProcurement.updateOne(
            {
              _id: existingPending._id,
              status: "processing",
            },
            {
              $set: {
                status: "completed",
                purchaseOrderId: existingOrder._id,
                totalAmount: existingOrder.totalAmount,
              },
            }
          );

          res.status(200).json({
            success: true,
            message: "This procurement was already confirmed.",
            data: {
              purchaseOrder: existingOrder,
              alreadyConfirmed: true,
            },
          });
          return;
        }

        res.status(409).json({
          success: false,
          message:
            "This procurement is already being processed. Please check again shortly.",
        });
        return;
      }

      if (existingPending.status !== "awaiting_confirmation") {
        res.status(409).json({
          success: false,
          message:
            "This procurement is not awaiting confirmation.",
          status: existingPending.status,
        });
        return;
      }

      if (existingPending.expiresAt <= new Date()) {
        await PendingProcurement.updateOne(
          {
            _id: existingPending._id,
            status: "awaiting_confirmation",
          },
          {
            $set: { status: "cancelled" },
          }
        );

        res.status(410).json({
          success: false,
          message:
            "This confirmation has expired. Please submit the request again in chat.",
        });
        return;
      }

      // Atomically claim the request so concurrent confirmations
      // cannot both create a purchase order.
      const pending =
        await PendingProcurement.findOneAndUpdate(
          {
            _id: existingPending._id,
            sessionId,
            status: "awaiting_confirmation",
            expiresAt: { $gt: new Date() },
          },
          {
            $set: {
              status: "processing",
              processingAt: new Date(),
            },
          },
          { new: true }
        );

      if (!pending) {
        res.status(409).json({
          success: false,
          message:
            "The request changed or expired. Refresh the conversation and try again.",
        });
        return;
      }

      try {
        if (
          !Number.isSafeInteger(pending.quantity) ||
          pending.quantity < 1 ||
          pending.quantity > MAX_QUANTITY
        ) {
          throw new Error(
            "The requested quantity is invalid."
          );
        }

        // Revalidate live database records instead of trusting
        // values previously displayed by the AI.
        const product = await Product.findById(
          pending.productId
        )
          .select("_id name sku costPrice isActive supplier")
          .lean();

        if (!product || !product.isActive) {
          throw new Error(
            "The selected product no longer exists or is inactive."
          );
        }

        if (
          typeof product.costPrice !== "number" ||
          !Number.isFinite(product.costPrice) ||
          product.costPrice <= 0
        ) {
          throw new Error(
            "The product does not have a valid purchase cost. Update its cost before confirming."
          );
        }

        if (!pending.supplierId) {
          throw new Error(
            "No supplier is assigned to this request. Please resolve the supplier before confirming."
          );
        }

        const supplier = await Supplier.findById(
          pending.supplierId
        )
          .select("_id companyName status")
          .lean();

        if (!supplier || supplier.status !== "Active") {
          throw new Error(
            "The assigned supplier no longer exists or is inactive."
          );
        }

        if (
          typeof product.supplier !== "string" ||
          product.supplier.trim().toLowerCase() !==
            supplier.companyName.trim().toLowerCase()
        ) {
          throw new Error(
            "The product's assigned supplier does not match the selected supplier. Correct the supplier assignment before confirming."
          );
        }

        const subtotal =
          product.costPrice * pending.quantity;

        if (
          !Number.isFinite(subtotal) ||
          subtotal <= 0 ||
          subtotal > MAX_ORDER_TOTAL
        ) {
          throw new Error(
            "The calculated purchase-order total is outside the permitted range."
          );
        }

        // A second idempotency check protects recovery after a
        // previous request successfully created the order.
        let purchaseOrder =
          await PurchaseOrder.findOne({
            pendingProcurementId: pending._id,
          });

        if (!purchaseOrder) {
          const orderNumber =
  `PO-${Date.now()}-${new mongoose.Types.ObjectId().toString().slice(-8)}`;

          try {
            purchaseOrder = await PurchaseOrder.create({
              orderNumber,
              pendingProcurementId: pending._id,
              supplier: supplier._id,
              supplierName: supplier.companyName,
              items: [
                {
                  product: product._id,
                  sku: product.sku,
                  productName: product.name,
                  quantity: pending.quantity,
                  unitPrice: product.costPrice,
                  total: subtotal,
                },
              ],
              subtotal,
              tax: 0,
              totalAmount: subtotal,
              status: "Pending",
              paymentStatus: "Pending",
            });
          } catch (error) {
            // If another request already created the PO, return
            // that order rather than creating a second one.
            if (isDuplicateKeyError(error)) {
              purchaseOrder =
                await PurchaseOrder.findOne({
                  pendingProcurementId: pending._id,
                });
            }

            if (!purchaseOrder) {
              throw error;
            }
          }
        }

        const requiresApproval = subtotal > 50_000;

        const completed =
          await PendingProcurement.findOneAndUpdate(
            {
              _id: pending._id,
              status: "processing",
            },
            {
              $set: {
                status: "completed",
                purchaseOrderId: purchaseOrder._id,
                totalAmount: subtotal,
                requiresApproval,
              },
            },
            { new: true }
          );

        if (!completed) {
          throw new Error(
            "The purchase order was created, but its confirmation record could not be updated. Retry confirmation to recover the existing order."
          );
        }

        res.status(201).json({
          success: true,
          message: requiresApproval
            ? "Purchase order created and awaiting approval."
            : "Purchase order created and awaiting approval.",
          data: {
            purchaseOrder,
            requiresApproval,
            alreadyConfirmed: false,
          },
        });
      } catch (error) {
        // Do not reset the request if a purchase order already
        // exists. A retry can then recover that order safely.
        const existingOrder =
          await PurchaseOrder.findOne({
            pendingProcurementId: pending._id,
          }).lean();

        if (!existingOrder) {
          await PendingProcurement.updateOne(
            {
              _id: pending._id,
              status: "processing",
            },
            {
              $set: {
                status: "awaiting_confirmation",
              },
              $unset: {
                processingAt: 1,
              },
            }
          );
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to confirm this procurement.";

        res.status(400).json({
          success: false,
          message,
          purchaseOrderCreated: Boolean(existingOrder),
        });
      }
    } catch (error) {
      console.error(
        "Procurement confirmation failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "An unexpected error occurred while confirming procurement.",
      });
    }
  }
);

export default router;