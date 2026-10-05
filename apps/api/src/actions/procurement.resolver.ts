import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

export interface ResolvePurchaseOrderInput {
  productName: string;
  quantity: number;
}

export interface ProcurementResolutionResult {
  success: boolean;
  resolved: boolean;
  message: string;

  product?: {
    id: unknown;
    name: string;
    sku: string;
    price: number;
    quantity: number;
  };

  supplier?: {
    id: unknown;
    name: string;
  };

  totalAmount?: number;
  requiresApproval?: boolean;
}

/**
 * Resolve a purchase-order request.
 *
 * Flow:
 *
 * User request
 *     ↓
 * Find product
 *     ↓
 * Find supplier assigned to product
 *     ↓
 * Verify supplier is active
 *     ↓
 * Calculate total
 *     ↓
 * Check ₹50,000 approval threshold
 */
export async function resolvePurchaseOrder(
  productName: string,
  quantity: number
): Promise<ProcurementResolutionResult> {
  // ----------------------------------------
  // Validate product name
  // ----------------------------------------

  if (!productName?.trim()) {
    return {
      success: false,
      resolved: false,
      message: "Product name is required.",
    };
  }

  // ----------------------------------------
  // Validate quantity
  // ----------------------------------------

  const numericQuantity = Number(quantity);

  if (
    !Number.isInteger(numericQuantity) ||
    numericQuantity <= 0
  ) {
    return {
      success: false,
      resolved: false,
      message:
        "Quantity must be a positive whole number.",
    };
  }

  // ----------------------------------------
  // Find product
  // ----------------------------------------

  const product = await Product.findOne({
    name: {
      $regex: escapeRegex(productName.trim()),
      $options: "i",
    },

    isActive: true,
  });

  if (!product) {
    return {
      success: false,
      resolved: false,
      message:
        `I could not find an active product matching "${productName}".`,
    };
  }

  // ----------------------------------------
  // Get supplier name from product
  // ----------------------------------------

  const supplierName =
    product.supplier?.trim();

  if (!supplierName) {
    return {
      success: false,
      resolved: false,
      message:
        `I found ${product.name}, but this product does not have a supplier assigned.`,
    };
  }

  // ----------------------------------------
  // Find active supplier
  // ----------------------------------------

  const supplier = await Supplier.findOne({
    companyName: {
      $regex: `^${escapeRegex(supplierName)}$`,
      $options: "i",
    },

    status: "Active",
  });

  if (!supplier) {
    return {
      success: false,
      resolved: false,
      message:
        `I found ${product.name}, but I could not identify an active supplier named "${supplierName}". Please specify the supplier.`,
    };
  }

  // ----------------------------------------
  // Validate product price
  // ----------------------------------------

  const unitPrice = Number(product.price);

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice < 0
  ) {
    return {
      success: false,
      resolved: false,
      message:
        `The product ${product.name} has an invalid price.`,
    };
  }

  // ----------------------------------------
  // Calculate total
  // ----------------------------------------

  const totalAmount =
    numericQuantity * unitPrice;

  // ----------------------------------------
  // Approval policy
  // ----------------------------------------

  const requiresApproval =
    totalAmount > 50000;

  // ----------------------------------------
  // Return resolved purchase order
  // ----------------------------------------

  return {
    success: true,

    resolved: true,

    product: {
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: unitPrice,
      quantity: numericQuantity,
    },

    supplier: {
      id: supplier._id,
      name: supplier.companyName,
    },

    totalAmount,

    requiresApproval,

    message: requiresApproval
      ? `Purchase order resolved for ${numericQuantity} × ${product.name} from ${supplier.companyName}. Total is ₹${totalAmount.toLocaleString(
          "en-IN"
        )}. Manager approval is required because the total exceeds ₹50,000.`
      : `Purchase order resolved for ${numericQuantity} × ${product.name} from ${supplier.companyName}. Total is ₹${totalAmount.toLocaleString(
          "en-IN"
        )}.`,
  };
}

/**
 * Escape regex characters before using a value
 * inside a MongoDB regular expression.
 */
function escapeRegex(
  value: string
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}