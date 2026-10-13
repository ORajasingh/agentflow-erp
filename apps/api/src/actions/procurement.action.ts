
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
  const { supplierId, items, tax = 0 } = input;

  // 1. Validate input
  if (
    !supplierId?.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Supplier ID and at least one purchase item are required."
    );
  }

  // 2. Validate tax
  const numericTax = Number(tax);

  if (
    !Number.isFinite(numericTax) ||
    numericTax < 0
  ) {
    throw new Error(
      "Tax must be a valid non-negative number."
    );
  }

  // 3. Find and validate supplier
  const supplier = await Supplier.findById(supplierId);

  if (!supplier) {
    throw new Error("Supplier not found.");
  }

  if (supplier.status !== "Active") {
    throw new Error("Supplier is not active.");
  }

  // 4. Validate all items before creating the PO
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item.productId) {
      throw new Error("Every item must have a product ID.");
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(
        `Product ${item.productId} not found.`
      );
    }

    if (product.isActive === false) {
      throw new Error(
        `Product ${product.name} is inactive.`
      );
    }

    const quantity = Number(item.quantity);

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Quantity for ${product.name} must be a positive whole number.`
      );
    }

    // Prefer procurement cost over the selling price.
    const defaultUnitCost =
      product.costPrice ?? product.price;

    // Always use the trusted procurement cost from the database.
// Do not let the frontend override the purchase price.
const unitPrice = Number(defaultUnitCost);

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      throw new Error(
        `Invalid procurement cost for ${product.name}.`
      );
    }

    const total = quantity * unitPrice;

    if (!Number.isFinite(total)) {
      throw new Error(
        `The line total for ${product.name} is invalid.`
      );
    }

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

  if (!Number.isFinite(subtotal)) {
    throw new Error("The purchase subtotal is invalid.");
  }

  // 5. Calculate final amount and approval requirement
  const totalAmount = subtotal + numericTax;

  if (!Number.isFinite(totalAmount)) {
    throw new Error("The purchase total is invalid.");
  }

  const requiresApproval = totalAmount > 50000;

  // 6. Generate PO number
  const orderNumber = `PO-${Date.now()}`;

  // 7. Create the purchase order only after validation
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

  // 8. Return result
  return {
    success: true,

    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      supplier: order.supplierName,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
    },

    requiresApproval,

    message: requiresApproval
      ? `Purchase order ${order.orderNumber} was created with status Pending. Manager approval is required because the total of ₹${totalAmount.toLocaleString("en-IN")} exceeds ₹50,000.`
      : `Purchase order ${order.orderNumber} was created successfully.`,
  };
}
