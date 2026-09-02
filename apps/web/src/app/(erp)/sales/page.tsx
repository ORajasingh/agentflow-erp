"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import ModulePage from "@/components/layout/ModulePage";

const API_URL = "http://localhost:4000";

interface Customer {
  _id: string;
  customerId: string;
  companyName: string;
  status: "Active" | "Prospect" | "Inactive";
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
}

interface SalesOrderItem {
  product: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SalesOrder {
  _id: string;
  orderNumber: string;
  customer: string;
  customerName: string;
  items: SalesOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Completed"
    | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Partial";
  orderDate: string;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] = useState(1);

  const [tax, setTax] = useState(0);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, customersResponse, productsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/sales-orders`),
          fetch(`${API_URL}/api/customers`),
          fetch(`${API_URL}/api/products`),
        ]);

      if (
        !ordersResponse.ok ||
        !customersResponse.ok ||
        !productsResponse.ok
      ) {
        throw new Error("Failed to load sales data");
      }

      const ordersResult = await ordersResponse.json();
      const customersResult =
        await customersResponse.json();
      const productsResult = await productsResponse.json();

      setOrders(ordersResult.data ?? []);
      setCustomers(customersResult.data ?? []);
      setProducts(productsResult.data ?? []);
    } catch (err) {
      console.error("Sales data error:", err);
      setError("Unable to load sales data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Selected product
  // --------------------------------------------------

  const selectedProductData = useMemo(() => {
    return products.find(
      (product) => product._id === selectedProduct
    );
  }, [products, selectedProduct]);

  // --------------------------------------------------
  // Order calculation
  // --------------------------------------------------

  const subtotal = selectedProductData
    ? selectedProductData.price * quantity
    : 0;

  const totalAmount = subtotal + Number(tax || 0);

  // --------------------------------------------------
  // Create order
  // --------------------------------------------------

  async function createOrder() {
    setCreateError("");
    setSuccessMessage("");

    if (!selectedCustomer) {
      setCreateError("Please select a customer.");
      return;
    }

    if (!selectedProduct) {
      setCreateError("Please select a product.");
      return;
    }

    if (!selectedProductData) {
      setCreateError("Selected product could not be found.");
      return;
    }

    if (quantity <= 0) {
      setCreateError("Quantity must be greater than zero.");
      return;
    }

    if (quantity > selectedProductData.stockQuantity) {
      setCreateError(
        `Only ${selectedProductData.stockQuantity} units are available.`
      );
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        `${API_URL}/api/sales-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId: selectedCustomer,
            items: [
              {
                productId: selectedProduct,
                quantity,
              },
            ],
            tax: Number(tax || 0),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create sales order"
        );
      }

      setSuccessMessage(
        `Order ${result.data.orderNumber} created successfully.`
      );

      setSelectedCustomer("");
      setSelectedProduct("");
      setQuantity(1);
      setTax(0);

      await loadData();

      setTimeout(() => {
        setShowCreateOrder(false);
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      console.error("Create order error:", err);

      setCreateError(
        err instanceof Error
          ? err.message
          : "Failed to create sales order"
      );
    } finally {
      setCreating(false);
    }
  }

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending" ||
      order.status === "Processing"
  ).length;

  return (
    <ModulePage
      title="Sales"
      description="Manage sales orders, customers, and revenue."
      icon={ShoppingCart}
      actionLabel="Create Order"
      onAction={() => {
        setShowCreateOrder(true);
        setCreateError("");
        setSuccessMessage("");
      }}
    >
      {/* --------------------------------------------- */}
      {/* Summary */}
      {/* --------------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Total Orders
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {orders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Revenue
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {completedOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm text-slate-500">
            Pending / Processing
          </p>

          <p className="mt-3 text-2xl font-bold text-white">
            {pendingOrders}
          </p>
        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Error */}
      {/* --------------------------------------------- */}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <AlertTriangle
            className="mx-auto text-red-400"
            size={24}
          />

          <p className="mt-3 text-sm font-medium text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* Orders */}
      {/* --------------------------------------------- */}

      {!error && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-white">
              Recent Sales Orders
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Live sales orders from MongoDB.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

              <p className="mt-4 text-sm text-slate-500">
                Loading sales orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingCart
                className="mx-auto text-slate-600"
                size={30}
              />

              <p className="mt-4 text-sm font-medium text-slate-400">
                No sales orders yet
              </p>

              <button
                type="button"
                onClick={() => setShowCreateOrder(true)}
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700"
              >
                Create First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/60">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-400">
                      Order
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Customer
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Product
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Quantity
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                    >
                      {/* Order */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {new Date(
                            order.orderDate
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 text-slate-300">
                        {order.customerName}
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        {order.items.length === 1 ? (
                          <div>
                            <p className="text-slate-300">
                              {order.items[0].productName}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-600">
                              {order.items[0].sku}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            {order.items.length} products
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-slate-400">
                        {order.items.reduce(
                          (sum, item) =>
                            sum + item.quantity,
                          0
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-medium text-white">
                        ₹
                        {order.totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-950 text-emerald-400"
                              : order.paymentStatus === "Partial"
                                ? "bg-blue-950 text-blue-400"
                                : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            order.status === "Completed"
                              ? "bg-emerald-950 text-emerald-400"
                              : order.status === "Processing"
                                ? "bg-blue-950 text-blue-400"
                                : order.status === "Cancelled"
                                  ? "bg-red-950 text-red-400"
                                  : "bg-amber-950 text-amber-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* Create Order Modal */}
      {/* --------------------------------------------- */}

      {showCreateOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create Sales Order
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a real order in MongoDB.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateOrder(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              {/* Success */}
              {successMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />

                  <p className="text-sm text-emerald-400">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Error */}
              {createError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <p className="text-sm text-red-400">
                    {createError}
                  </p>
                </div>
              )}

              {/* Customer */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Customer
                </label>

                <select
                  value={selectedCustomer}
                  onChange={(event) =>
                    setSelectedCustomer(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-600"
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers
                    .filter(
                      (customer) =>
                        customer.status !== "Inactive"
                    )
                    .map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.companyName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Product
                </label>

                <select
                  value={selectedProduct}
                  onChange={(event) => {
                    setSelectedProduct(event.target.value);
                    setQuantity(1);
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-600"
                >
                  <option value="">
                    Select product
                  </option>

                  {products
                    .filter(
                      (product) =>
                        product.isActive &&
                        product.stockQuantity > 0
                    )
                    .map((product) => (
                      <option
                        key={product._id}
                        value={product._id}
                      >
                        {product.name} — ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}{" "}
                        — Stock: {product.stockQuantity}
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Quantity
                </label>

                <input
                  type="number"
                  min={1}
                  max={
                    selectedProductData?.stockQuantity ?? 1
                  }
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Number(event.target.value) || 1
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-600"
                />

                {selectedProductData && (
                  <p className="mt-2 text-[11px] text-slate-600">
                    Available stock:{" "}
                    {selectedProductData.stockQuantity}
                  </p>
                )}
              </div>

              {/* Tax */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Tax Amount
                </label>

                <input
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(event) =>
                    setTax(Number(event.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-600"
                />
              </div>

              {/* Order preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <span className="text-slate-300">
                    ₹{Number(tax || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="my-3 border-t border-slate-800" />

                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300">
                    Total
                  </span>

                  <span className="text-xl font-bold text-white">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 border-t border-slate-800 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowCreateOrder(false)}
                className="flex-1 rounded-xl border border-slate-800 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createOrder}
                disabled={creating}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  );
}