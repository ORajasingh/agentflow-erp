"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardList,
  PackageCheck,
  Plus,
  RefreshCw,
  Truck,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Supplier {
  _id: string;
  supplierId: string;
  companyName: string;
  status: "Active" | "Inactive" | "Pending";
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
}

interface PurchaseOrderItem {
  product: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplier: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status:
    | "Draft"
    | "Pending"
    | "Approved"
    | "Ordered"
    | "Received"
    | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Partial";
  orderDate: string;
  createdAt: string;
}

interface FormItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [tax, setTax] = useState(0);

  const [formItems, setFormItems] = useState<FormItem[]>([
    {
      productId: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.status === "Active"),
    [suppliers]
  );

  const subtotal = useMemo(() => {
    return formItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );
  }, [formItems]);

  const totalAmount = subtotal + Number(tax || 0);

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/purchase-orders`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchase orders");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to fetch purchase orders"
        );
      }

      setOrders(result.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load purchase orders.");
    }
  }

  async function fetchSuppliers() {
    try {
      const response = await fetch(
        `${API_URL}/api/suppliers`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const result = await response.json();

      if (result.success) {
        setSuppliers(result.data || []);
      }
    } catch (err) {
      console.error("Supplier fetch error:", err);
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch(
        `${API_URL}/api/products`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
    }
  }

  async function refreshData() {
    setLoading(true);

    await Promise.all([
      fetchOrders(),
      fetchSuppliers(),
      fetchProducts(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    refreshData();
  }, []);

  function openCreateModal() {
    setSupplierId("");
    setTax(0);

    setFormItems([
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (!saving) {
      setShowModal(false);
    }
  }

  function updateItem(
    index: number,
    field: keyof FormItem,
    value: string | number
  ) {
    setFormItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  function handleProductChange(
    index: number,
    productId: string
  ) {
    const product = products.find(
      (item) => item._id === productId
    );

    setFormItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          productId,
          unitPrice: product
            ? Number(product.costPrice || product.price || 0)
            : 0,
        };
      })
    );
  }

  function addItem() {
    setFormItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    if (formItems.length === 1) {
      return;
    }

    setFormItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function createPurchaseOrder() {
    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    const invalidItem = formItems.some(
      (item) =>
        !item.productId ||
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      setError(
        "Please select a product and enter valid quantity and price."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/purchase-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplierId,
            tax: Number(tax) || 0,
            items: formItems.map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create purchase order"
        );
      }

      setShowModal(false);

      await fetchOrders();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create purchase order."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateOrder(
    id: string,
    action: "approve" | "order" | "receive"
  ) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/purchase-orders/${id}/${action}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update purchase order"
        );
      }

      await fetchOrders();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update purchase order."
      );
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getStatusClass(status: PurchaseOrder["status"]) {
    switch (status) {
      case "Received":
        return "bg-emerald-950 text-emerald-400";

      case "Approved":
        return "bg-blue-950 text-blue-400";

      case "Ordered":
        return "bg-violet-950 text-violet-400";

      case "Cancelled":
        return "bg-red-950 text-red-400";

      case "Pending":
      default:
        return "bg-amber-950 text-amber-400";
    }
  }

  function getAction(order: PurchaseOrder) {
    if (order.status === "Pending") {
      return (
        <button
          type="button"
          onClick={() =>
            updateOrder(order._id, "approve")
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          <Check size={14} />
          Approve
        </button>
      );
    }

    if (order.status === "Approved") {
      return (
        <button
          type="button"
          onClick={() =>
            updateOrder(order._id, "order")
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700"
        >
          <Truck size={14} />
          Order
        </button>
      );
    }

    if (order.status === "Ordered") {
      return (
        <button
          type="button"
          onClick={() =>
            updateOrder(order._id, "receive")
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
        >
          <PackageCheck size={14} />
          Receive
        </button>
      );
    }

    return (
      <span className="text-xs text-slate-600">
        No action
      </span>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
              <ClipboardList size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Purchase Orders
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage supplier purchase orders.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refreshData}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              <Plus size={17} />
              Create Purchase Order
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-medium text-slate-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {
                orders.filter(
                  (order) => order.status === "Pending"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-medium text-slate-500">
              Ordered
            </p>

            <p className="mt-2 text-2xl font-bold text-violet-400">
              {
                orders.filter(
                  (order) => order.status === "Ordered"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs font-medium text-slate-500">
              Received
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {
                orders.filter(
                  (order) => order.status === "Received"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-white">
              Purchase Orders
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track purchasing from supplier creation through receiving.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-16">
              <RefreshCw
                size={22}
                className="animate-spin text-violet-400"
              />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <ClipboardList
                size={40}
                className="text-slate-700"
              />

              <h3 className="mt-4 font-medium text-white">
                No purchase orders
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first purchase order to get started.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                <Plus size={16} />
                Create Purchase Order
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
                      Supplier
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Items
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Total
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {new Date(
                            order.orderDate || order.createdAt
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {order.supplierName}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <p
                              key={`${order._id}-${index}`}
                              className="text-xs text-slate-400"
                            >
                              {item.productName} ×{" "}
                              {item.quantity}
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {getAction(order)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create Purchase Order
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a supplier and add products to the order.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-900 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Supplier */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Supplier
                </label>

                <div className="relative">
                  <select
                    value={supplierId}
                    onChange={(event) =>
                      setSupplierId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="">
                      Select active supplier
                    </option>

                    {activeSuppliers.map((supplier) => (
                      <option
                        key={supplier._id}
                        value={supplier._id}
                      >
                        {supplier.companyName} —{" "}
                        {supplier.supplierId}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {activeSuppliers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    No active suppliers found. Create a supplier first.
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Order Items
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Add the products you want to purchase.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formItems.map((item, index) => {
                    const selectedProduct = products.find(
                      (product) =>
                        product._id === item.productId
                    );

                    const lineTotal =
                      Number(item.quantity || 0) *
                      Number(item.unitPrice || 0);

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                      >
                        <div className="grid gap-4 md:grid-cols-12">
                          <div className="md:col-span-5">
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Product
                            </label>

                            <select
                              value={item.productId}
                              onChange={(event) =>
                                handleProductChange(
                                  index,
                                  event.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                            >
                              <option value="">
                                Select product
                              </option>

                              {products.map((product) => (
                                <option
                                  key={product._id}
                                  value={product._id}
                                >
                                  {product.name} — {product.sku}
                                </option>
                              ))}
                            </select>

                            {selectedProduct && (
                              <p className="mt-1 text-[11px] text-slate-600">
                                Current stock:{" "}
                                {selectedProduct.stockQuantity}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(event.target.value)
                                )
                              }
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Unit Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  Number(event.target.value)
                                )
                              }
                              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Total
                            </label>

                            <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-medium text-white">
                              {formatCurrency(lineTotal)}
                            </div>
                          </div>

                          <div className="flex items-end justify-end md:col-span-1">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={formItems.length === 1}
                              className="rounded-lg p-2.5 text-slate-500 transition hover:bg-red-950 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                              title="Remove item"
                            >
                              <X size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="ml-auto max-w-sm rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <label
                    htmlFor="tax"
                    className="text-sm text-slate-500"
                  >
                    Tax
                  </label>

                  <input
                    id="tax"
                    type="number"
                    min="0"
                    value={tax}
                    onChange={(event) =>
                      setTax(Number(event.target.value))
                    }
                    className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="my-4 border-t border-slate-800" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    Total
                  </span>

                  <span className="text-xl font-bold text-white">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Modal Error */}
              {error && (
                <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createPurchaseOrder}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
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
        </div>
      )}
    </main>
  );
}