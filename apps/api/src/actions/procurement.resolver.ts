import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

export interface ResolvedPurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface ResolvedPurchaseOrder {
  supplierId: string;
  supplierName: string;
  items: ResolvedPurchaseOrderItem[];
  tax: number;
  subtotal: number;
  totalAmount: number;
  requiresApproval: boolean;
}

export interface ResolvePurchaseOrderResult {
  success: boolean;
  resolved: boolean;
  message: string;
  order?: ResolvedPurchaseOrder;
}

// ============================================================
// EXTRACT QUANTITY
// ============================================================

function extractQuantity(
  message: string
): number | null {
  const patterns = [
    /(?:for|quantity|qty)\s+(\d+)/i,
    /(\d+)\s+(?:units?|items?|products?|laptops?|pcs?)/i,
  ];

  for (const pattern of patterns) {
    const match =
      message.match(pattern);

    if (match) {
      const quantity =
        Number(match[1]);

      if (
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        return quantity;
      }
    }
  }

  return null;
}

// ============================================================
// FIND PRODUCT
// ============================================================

async function findProduct(
  message: string
) {
  const text =
    message
      .toLowerCase()
      .trim();

  const products =
    await Product.find({
      isActive: true,
    });

  // ----------------------------------------
  // Exact product / SKU match
  // ----------------------------------------

  const exactMatches =
    products.filter((product) => {
      const name =
        String(product.name || "")
          .toLowerCase();

      const sku =
        String(product.sku || "")
          .toLowerCase();

      return (
        text.includes(name) ||
        text.includes(sku)
      );
    });

  if (exactMatches.length === 1) {
    return {
      type: "single" as const,
      product: exactMatches[0],
    };
  }

  if (exactMatches.length > 1) {
    return {
      type: "multiple" as const,
      products: exactMatches,
    };
  }

  // ----------------------------------------
  // Token fallback
  // ----------------------------------------

  const words =
    text
      .split(/\s+/)
      .map((word) =>
        word.replace(
          /[^a-zA-Z0-9-]/g,
          ""
        )
      )
      .filter(
        (word) =>
          word.length >= 3
      );

  const tokenMatches =
    products.filter((product) => {
      const name =
        String(product.name || "")
          .toLowerCase();

      const sku =
        String(product.sku || "")
          .toLowerCase();

      return words.some(
        (word) =>
          name.includes(word) ||
          sku.includes(word)
      );
    });

  if (tokenMatches.length === 1) {
    return {
      type: "single" as const,
      product: tokenMatches[0],
    };
  }

  if (tokenMatches.length > 1) {
    return {
      type: "multiple" as const,
      products: tokenMatches,
    };
  }

  return {
    type: "none" as const,
  };
}

// ============================================================
// FIND SUPPLIER
// ============================================================

async function findSupplier(
  message: string,
  productSupplier?: string
) {
  const suppliers =
    await Supplier.find({
      status: "Active",
    });

  // ----------------------------------------
  // 1. Use supplier stored on product
  // ----------------------------------------

  if (productSupplier) {
    const normalizedProductSupplier =
      productSupplier
        .trim()
        .toLowerCase();

    const productSupplierMatches =
      suppliers.filter(
        (supplier) => {
          const companyName =
            String(
              supplier.companyName || ""
            )
              .trim()
              .toLowerCase();

          return (
            companyName ===
              normalizedProductSupplier ||
            companyName.includes(
              normalizedProductSupplier
            ) ||
            normalizedProductSupplier.includes(
              companyName
            )
          );
        }
      );

    if (
      productSupplierMatches.length ===
      1
    ) {
      return {
        type: "single" as const,
        supplier:
          productSupplierMatches[0],
      };
    }

    if (
      productSupplierMatches.length > 1
    ) {
      return {
        type: "multiple" as const,
        suppliers:
          productSupplierMatches,
      };
    }
  }

  // ----------------------------------------
  // 2. Look for explicit supplier
  //    in user's message
  // ----------------------------------------

  const text =
    message
      .toLowerCase()
      .trim();

  const explicitMatches =
    suppliers.filter(
      (supplier) => {
        const companyName =
          String(
            supplier.companyName || ""
          )
            .trim()
            .toLowerCase();

        return text.includes(
          companyName
        );
      }
    );

  if (
    explicitMatches.length === 1
  ) {
    return {
      type: "single" as const,
      supplier:
        explicitMatches[0],
    };
  }

  if (
    explicitMatches.length > 1
  ) {
    return {
      type: "multiple" as const,
      suppliers:
        explicitMatches,
    };
  }

  return {
    type: "none" as const,
  };
}

// ============================================================
// RESOLVE PURCHASE ORDER
// ============================================================

export async function resolvePurchaseOrder(
  message: string
): Promise<ResolvePurchaseOrderResult> {
  if (
    !message ||
    !message.trim()
  ) {
    return {
      success: false,
      resolved: false,
      message:
        "Purchase order request is empty.",
    };
  }

  // ----------------------------------------
  // Quantity
  // ----------------------------------------

  const quantity =
    extractQuantity(message);

  if (quantity === null) {
    return {
      success: true,
      resolved: false,
      message:
        "How many units should I include in the purchase order?",
    };
  }

  // ----------------------------------------
  // Product
  // ----------------------------------------

  const productResult =
    await findProduct(message);

  if (
    productResult.type === "none"
  ) {
    return {
      success: true,
      resolved: false,
      message:
        "I could not identify the product. Please provide the exact product name or SKU.",
    };
  }

  if (
    productResult.type === "multiple"
  ) {
    const names =
      productResult.products
        .map(
          (product) =>
            `${product.name} (${product.sku})`
        )
        .join(", ");

    return {
      success: true,
      resolved: false,
      message:
        `I found multiple matching products: ${names}. Please specify which product you want.`,
    };
  }

  const product =
    productResult.product;

  // ----------------------------------------
  // Supplier
  // ----------------------------------------

  const supplierResult =
    await findSupplier(
      message,
      product.supplier
    );

  if (
    supplierResult.type === "none"
  ) {
    return {
      success: true,
      resolved: false,
      message:
        `I found ${product.name}, but I could not identify an active supplier. Please specify the supplier.`,
    };
  }

  if (
    supplierResult.type === "multiple"
  ) {
    const names =
      supplierResult.suppliers
        .map(
          (supplier) =>
            supplier.companyName
        )
        .join(", ");

    return {
      success: true,
      resolved: false,
      message:
        `I found multiple active suppliers: ${names}. Please specify which supplier you want.`,
    };
  }

  const supplier =
    supplierResult.supplier;

  // ----------------------------------------
  // Price
  //
  // Keep the same business rule as
  // createPurchaseOrder().
  //
  // It currently uses product.price.
  // ----------------------------------------

  const unitPrice =
    Number(product.price);

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice < 0
  ) {
    return {
      success: false,
      resolved: false,
      message:
        `The price for ${product.name} is invalid or unavailable.`,
    };
  }

  // ----------------------------------------
  // Calculate totals
  // ----------------------------------------

  const subtotal =
    quantity * unitPrice;

  const tax = 0;

  const totalAmount =
    subtotal + tax;

  const requiresApproval =
    totalAmount > 50000;

  // ----------------------------------------
  // Build resolved order
  // ----------------------------------------

  const order: ResolvedPurchaseOrder =
    {
      supplierId:
        String(supplier._id),

      supplierName:
        supplier.companyName,

      items: [
        {
          productId:
            String(product._id),

          productName:
            product.name,

          sku:
            product.sku,

          quantity,

          unitPrice,
        },
      ],

      tax,

      subtotal,

      totalAmount,

      requiresApproval,
    };

  // ----------------------------------------
  // Confirmation message
  // ----------------------------------------

  const approvalMessage =
    requiresApproval
      ? "\n\n⚠️ This purchase order will require manager approval because the total exceeds ₹50,000."
      : "";

  return {
    success: true,
    resolved: true,

    message:
      `I found the following purchase order:\n\n` +
      `Supplier: ${supplier.companyName}\n` +
      `Product: ${product.name}\n` +
      `SKU: ${product.sku}\n` +
      `Quantity: ${quantity}\n` +
      `Unit price: ₹${unitPrice.toLocaleString("en-IN")}\n` +
      `Subtotal: ₹${subtotal.toLocaleString("en-IN")}\n` +
      `Total: ₹${totalAmount.toLocaleString("en-IN")}` +
      approvalMessage +
      `\n\nWould you like me to create this purchase order?`,

    order,
  };
}