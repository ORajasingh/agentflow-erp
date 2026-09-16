import PurchaseOrder from "../models/PurchaseOrder.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

export async function getProcurementInsights() {
  const [orders, suppliers] = await Promise.all([
    PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .lean(),

    Supplier.find({
      status: "Active",
    }).lean(),
  ]);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  );

  const approvedOrders = orders.filter(
    (order) => order.status === "Approved"
  );

  const orderedOrders = orders.filter(
    (order) => order.status === "Ordered"
  );

  const receivedOrders = orders.filter(
    (order) => order.status === "Received"
  );

  const totalPurchaseValue = orders.reduce(
    (total, order) =>
      total + order.totalAmount,
    0
  );

  const pendingPurchaseValue =
    pendingOrders.reduce(
      (total, order) =>
        total + order.totalAmount,
      0
    );

  const supplierRanking = suppliers
    .map((supplier) => ({
      supplierId: supplier.supplierId,
      companyName: supplier.companyName,
      rating: supplier.rating,
      totalOrders: supplier.totalOrders,
      totalPurchaseValue:
        supplier.totalPurchaseValue,
      status: supplier.status,
    }))
    .sort(
      (a, b) =>
        b.totalPurchaseValue -
        a.totalPurchaseValue
    );

  return {
    totalOrders,
    pendingOrders: pendingOrders.length,
    approvedOrders: approvedOrders.length,
    orderedOrders: orderedOrders.length,
    receivedOrders: receivedOrders.length,
    totalPurchaseValue,
    pendingPurchaseValue,
    supplierRanking,
    recentOrders: orders.slice(0, 10),
  };
}

/**
 * Get products that are below their reorder level.
 *
 * This is READ-ONLY.
 */
export async function getLowStockProducts() {
  const products = await Product.find({
    isActive: true,
    $expr: {
      $lt: [
        "$stockQuantity",
        "$reorderLevel",
      ],
    },
  })
    .sort({
      stockQuantity: 1,
    })
    .lean();

  return products.map((product) => ({
    productId: product._id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    brand: product.brand,
    currentStock: product.stockQuantity,
    reorderLevel: product.reorderLevel,
    suggestedQuantity:
      product.reorderLevel -
      product.stockQuantity,
    unitPrice: product.price,
    costPrice: product.costPrice,
    warehouse: product.warehouse,
    supplier: product.supplier,
  }));
}

/**
 * Find active suppliers that can potentially
 * be used for procurement.
 *
 * This is READ-ONLY.
 */
export async function getActiveSuppliers() {
  const suppliers = await Supplier.find({
    status: "Active",
  })
    .sort({
      rating: -1,
    })
    .lean();

  return suppliers.map((supplier) => ({
    id: supplier._id,
    supplierId: supplier.supplierId,
    companyName: supplier.companyName,
    contactPerson:
      supplier.contactPerson,
    category: supplier.category,
    rating: supplier.rating,
    totalOrders:
      supplier.totalOrders,
    totalPurchaseValue:
      supplier.totalPurchaseValue,
    status: supplier.status,
  }));
}

/**
 * Prepare a purchase order draft.
 *
 * IMPORTANT:
 * This function DOES NOT create the purchase order.
 * It only prepares the information required
 * for user confirmation.
 */
export async function preparePurchaseOrderDraft() {
  const [lowStockProducts, suppliers] =
    await Promise.all([
      getLowStockProducts(),
      getActiveSuppliers(),
    ]);

  if (lowStockProducts.length === 0) {
    return {
      success: true,
      hasLowStock: false,
      message:
        "There are currently no products below their reorder levels.",
      products: [],
      suppliers,
    };
  }

  return {
    success: true,
    hasLowStock: true,
    products: lowStockProducts,
    suppliers,
  };
}