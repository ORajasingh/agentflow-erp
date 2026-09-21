import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

export interface CreatePurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: CreatePurchaseOrderItem[];
  tax?: number;
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput
) {
  const {
    supplierId,
    items,
    tax = 0,
  } = input;

  // ----------------------------------------
  // Validate input
  // ----------------------------------------

  if (
    !supplierId ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "supplierId and at least one item are required"
    );
  }

  // ----------------------------------------
  // Find supplier
  // ----------------------------------------

  const supplier =
    await Supplier.findById(supplierId);

  if (!supplier) {
    throw new Error(
      "Supplier not found"
    );
  }

  if (supplier.status !== "Active") {
    throw new Error(
      "Supplier is not active"
    );
  }

  // ----------------------------------------
  // Build PO items
  // ----------------------------------------

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product =
      await Product.findById(
        item.productId
      );

    if (!product) {
      throw new Error(
        `Product ${item.productId} not found`
      );
    }

    const quantity =
      Number(item.quantity);

    const unitPrice =
      Number(
        item.unitPrice ??
          product.price
      );

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Invalid quantity for ${product.name}`
      );
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error(
        `Invalid unit price for ${product.name}`
      );
    }

    const total =
      quantity * unitPrice;

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

  // ----------------------------------------
  // Calculate total
  // ----------------------------------------

  const numericTax =
    Number(tax) || 0;

  const totalAmount =
    subtotal + numericTax;

  // ----------------------------------------
  // Generate PO number
  // ----------------------------------------

  const orderNumber =
    `PO-${Date.now()}`;

  // ----------------------------------------
  // Create purchase order
  // ----------------------------------------

  const order =
    await PurchaseOrder.create({
      orderNumber,

      supplier:
        supplier._id,

      supplierName:
        supplier.companyName,

      items:
        orderItems,

      subtotal,

      tax:
        numericTax,

      totalAmount,

      status:
        "Pending",

      paymentStatus:
        "Pending",
    });

  // ----------------------------------------
  // Approval requirement
  // ----------------------------------------

  const requiresApproval =
    totalAmount > 50000;

  return {
    success: true,

    order: {
      id: order._id,
      orderNumber:
        order.orderNumber,

      supplier:
        order.supplierName,

      items:
        order.items,

      subtotal:
        order.subtotal,

      tax:
        order.tax,

      totalAmount:
        order.totalAmount,

      status:
        order.status,

      paymentStatus:
        order.paymentStatus,
    },

    requiresApproval,

    message:
      requiresApproval
        ? "Purchase order created and requires manager approval because the total exceeds ₹50,000."
        : "Purchase order created successfully.",
  };
}