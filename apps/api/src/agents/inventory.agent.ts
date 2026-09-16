import Product from "../models/Product.js";

export async function getInventoryInsights() {
  const products = await Product.find({
    isActive: true,
  }).lean();

  const lowStock = products.filter(
    (product) =>
      product.stockQuantity <= product.reorderLevel
  );

  const outOfStock = products.filter(
    (product) =>
      product.stockQuantity === 0
  );

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) =>
      total + product.stockQuantity,
    0
  );

  return {
    totalProducts,
    totalUnits,
    lowStock,
    outOfStock,
  };
}