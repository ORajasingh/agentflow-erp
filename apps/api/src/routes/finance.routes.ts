import { Router } from "express";

import FinanceTransaction from "../models/FinanceTransaction.js";

const router = Router();

/**
 * GET /api/finance
 * Get all finance transactions
 */
router.get("/", async (_req, res) => {
  try {
    const transactions = await FinanceTransaction.find()
      .sort({ transactionDate: -1 })
      .lean();

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error(
      "Failed to fetch finance transactions:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch finance transactions",
    });
  }
});

/**
 * GET /api/finance/summary
 * Get financial summary
 */
router.get("/summary", async (_req, res) => {
  try {
    const transactions =
      await FinanceTransaction.find().lean();

    let totalIncome = 0;
    let totalExpense = 0;
    let pendingIncome = 0;
    let pendingExpense = 0;

    for (const transaction of transactions) {
      if (transaction.type === "Income") {
        totalIncome += transaction.amount;

        if (
          transaction.paymentStatus === "Pending" ||
          transaction.paymentStatus === "Partial"
        ) {
          pendingIncome += transaction.amount;
        }
      }

      if (transaction.type === "Expense") {
        totalExpense += transaction.amount;

        if (
          transaction.paymentStatus === "Pending" ||
          transaction.paymentStatus === "Partial"
        ) {
          pendingExpense += transaction.amount;
        }
      }
    }

    const netProfit =
      totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        pendingIncome,
        pendingExpense,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error(
      "Failed to calculate finance summary:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate finance summary",
    });
  }
});

/**
 * GET /api/finance/:id
 * Get one transaction
 */
router.get("/:id", async (req, res) => {
  try {
    const transaction =
      await FinanceTransaction.findById(
        req.params.id
      ).lean();

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });

      return;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error(
      "Failed to fetch transaction:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
    });
  }
});

/**
 * POST /api/finance
 * Create finance transaction
 */
router.post("/", async (req, res) => {
  try {
    const {
      type,
      category,
      description,
      amount,
      reference,
      relatedOrder,
      paymentStatus = "Pending",
      paymentMethod,
      transactionDate,
    } = req.body;

    if (
      !type ||
      !category ||
      !description ||
      amount === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "type, category, description and amount are required",
      });

      return;
    }

    if (
      type !== "Income" &&
      type !== "Expense"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Type must be Income or Expense",
      });

      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid amount",
      });

      return;
    }

    const transactionId =
      `TXN-${Date.now()}`;

    const transaction =
      await FinanceTransaction.create({
        transactionId,
        type,
        category,
        description,
        amount: numericAmount,
        reference,
        relatedOrder,
        paymentStatus,
        paymentMethod,
        transactionDate,
      });

    res.status(201).json({
      success: true,
      message:
        "Finance transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error(
      "Failed to create finance transaction:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        "Failed to create finance transaction",
    });
  }
});

/**
 * PATCH /api/finance/:id/payment
 * Update payment status
 */
router.patch(
  "/:id/payment",
  async (req, res) => {
    try {
      const {
        paymentStatus,
        paymentMethod,
      } = req.body;

      if (
        ![
          "Pending",
          "Paid",
          "Partial",
        ].includes(paymentStatus)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });

        return;
      }

      const transaction =
        await FinanceTransaction.findById(
          req.params.id
        );

      if (!transaction) {
        res.status(404).json({
          success: false,
          message:
            "Transaction not found",
        });

        return;
      }

      transaction.paymentStatus =
        paymentStatus;

      if (paymentMethod) {
        transaction.paymentMethod =
          paymentMethod;
      }

      await transaction.save();

      res.json({
        success: true,
        message:
          "Payment status updated successfully",
        data: transaction,
      });
    } catch (error) {
      console.error(
        "Failed to update payment status:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update payment status",
      });
    }
  }
);

/**
 * DELETE /api/finance/:id
 * Delete a finance transaction
 */
router.delete("/:id", async (req, res) => {
  try {
    const transaction =
      await FinanceTransaction.findByIdAndDelete(
        req.params.id
      );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });

      return;
    }

    res.json({
      success: true,
      message:
        "Finance transaction deleted successfully",
    });
  } catch (error) {
    console.error(
      "Failed to delete finance transaction:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete finance transaction",
    });
  }
});

export default router;