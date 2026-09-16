import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import SalesOrder from "../models/SalesOrder.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import FinanceTransaction from "../models/FinanceTransaction.js";

export async function getERPContext() {
  const [
    products,
    suppliers,
    salesOrders,
    purchaseOrders,
    financeTransactions,
  ] = await Promise.all([
    Product.find({ isActive: true }).lean(),
    Supplier.find().lean(),
    SalesOrder.find().sort({ createdAt: -1 }).limit(50).lean(),
    PurchaseOrder.find().sort({ createdAt: -1 }).limit(50).lean(),
    FinanceTransaction.find()
      .sort({ transactionDate: -1 })
      .limit(100)
      .lean(),
  ]);

  return {
    products,
    suppliers,
    salesOrders,
    purchaseOrders,
    financeTransactions,
  };
}