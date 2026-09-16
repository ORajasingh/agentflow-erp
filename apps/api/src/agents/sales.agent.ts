import SalesOrder from "../models/SalesOrder.js";

export async function getSalesInsights() {
  const orders = await SalesOrder.find()
    .sort({ createdAt: -1 })
    .lean();

  const totalOrders = orders.length;

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  );

  const totalSales = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const pendingPayments = orders
    .filter(
      (order) => order.paymentStatus !== "Paid"
    )
    .reduce(
      (total, order) => total + order.totalAmount,
      0
    );

  const topProducts = new Map<
    string,
    {
      productName: string;
      quantity: number;
      revenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = topProducts.get(
        item.productName
      );

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total;
      } else {
        topProducts.set(item.productName, {
          productName: item.productName,
          quantity: item.quantity,
          revenue: item.total,
        });
      }
    }
  }

  const bestSellingProducts = Array.from(
    topProducts.values()
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    totalOrders,
    confirmedOrders: confirmedOrders.length,
    totalSales,
    pendingPayments,
    bestSellingProducts,
    recentOrders: orders.slice(0, 10),
  };
}