
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

export async function resolvePurchaseOrder(
  productName: string,
  quantity: number
): Promise<ProcurementResolutionResult> {
  // 1. Validate product name
  const cleanProductName = productName?.trim();

  if (!cleanProductName) {
    return {
      success: false,
      resolved: false,
      message: "Please specify the product you want to purchase.",
    };
  }

  // 2. Validate quantity
  const numericQuantity = Number(quantity);

  if (
    !Number.isSafeInteger(numericQuantity) ||
    numericQuantity <= 0
  ) {
    return {
      success: false,
      resolved: false,
      message: "Quantity must be a positive whole number.",
    };
  }

  // 3. Find an active product
 const product = await Product.findOne({
  name: {
    $regex: `^${escapeRegex(cleanProductName)}$`,
    $options: "i",
  },
  isActive: true,
});

  if (!product) {
    return {
      success: false,
      resolved: false,
      message: `I could not find an active product matching "${cleanProductName}".`,
    };
  }

  // 4. Read the supplier assigned to the product
  const supplierName = String(product.supplier ?? "").trim();

  if (!supplierName) {
    return {
      success: false,
      resolved: false,
      message: `I found ${product.name}, but no supplier is assigned to this product.`,
    };
  }

  // 5. Find the exact active supplier
  const supplier = await Supplier.findOne({
    companyName: {
      $regex: `^${escapeRegex(supplierName)}$`,
      $options: "i",
    },
    status: "Active",
  });

  if (!supplier) {
    const availableSuppliers = await Supplier.find({
      status: "Active",
    })
      .select("companyName")
      .limit(10)
      .lean();

    const supplierNames = availableSuppliers
      .map((item) => item.companyName)
      .filter(Boolean);

    return {
      success: false,
      resolved: false,
      message:
        `The product ${product.name} is assigned to "${supplierName}", ` +
        "but that supplier could not be matched to an active supplier record." +
        (supplierNames.length
          ? ` Available active suppliers: ${supplierNames.join(", ")}.`
          : " There are no active suppliers available.") +
        " Please confirm the correct supplier before proceeding.",
    };
  }

  // 6. Calculate procurement cost.
  // Prefer costPrice; fall back to price only if costPrice is unavailable.
  const rawCost = product.costPrice ?? product.price;
  const unitCost = Number(rawCost);

  if (!Number.isFinite(unitCost) || unitCost <= 0) {
    return {
      success: false,
      resolved: false,
      message: `The procurement cost for ${product.name} is invalid or missing.`,
    };
  }

  const totalAmount = numericQuantity * unitCost;

  if (!Number.isFinite(totalAmount)) {
    return {
      success: false,
      resolved: false,
      message: "The purchase total is too large to calculate safely.",
    };
  }

  // 7. Apply the approval policy
  const requiresApproval = totalAmount > 50000;

  // 8. Return the resolution only.
  // This function does NOT create a purchase order.
  return {
    success: true,
    resolved: true,

    product: {
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: unitCost,
      quantity: numericQuantity,
    },

    supplier: {
      id: supplier._id,
      name: supplier.companyName,
    },

    totalAmount,
    requiresApproval,

    message:
      `Purchase details resolved: ${numericQuantity} × ${product.name} ` +
      `from ${supplier.companyName}. Unit cost: ₹${unitCost.toLocaleString("en-IN")}. ` +
      `Total: ₹${totalAmount.toLocaleString("en-IN")}. ` +
      (requiresApproval
        ? "Manager approval is required because the total exceeds ₹50,000. "
        : "") +
      "No purchase order has been created yet.",
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
