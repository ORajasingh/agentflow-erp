"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Plus,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

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
}

interface OrderLine {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const emptyLine: OrderLine = {
  productId: "",
  quantity: 1,
  unitPrice: 0,
};

export default function ProcurementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(
    []
  );

  const [suppliers, setSuppliers] = useState<Supplier[]>(
    []
  );

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        ordersResponse,
        suppliersResponse,
        productsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/purchase-orders`),
        fetch(`${API_URL}/api/suppliers`),
        fetch(`${API_URL}/api/products`),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(
          "Failed to fetch purchase orders"
        );
      }

      const ordersResult =
        await ordersResponse.json();

      const suppliersResult =
        await suppliersResponse.json();

      const productsResult =
        await productsResponse.json();

      setOrders(ordersResult.data || []);
      setSuppliers(suppliersResult.data || []);
      setProducts(productsResult.data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load procurement data. Make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.orderNumber
          .toLowerCase()
          .includes(value) ||
        order.supplierName
          .toLowerCase()
          .includes(value) ||
        order.status
          .toLowerCase()
          .includes(value)
    );
  }, [orders, search]);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const approvedCount = orders.filter(
    (order) => order.status === "Approved"
  ).length;

  const orderedCount = orders.filter(
    (order) => order.status === "Ordered"
  ).length;

  const totalPurchaseValue = orders.reduce(
    (sum, order) =>
      sum + order.totalAmount,
    0
  );

  async function updateOrder(
    orderId: string,
    action: "approve" | "order" | "receive"
  ) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/purchase-orders/${orderId}/${action}`,
        {
          method: "PATCH",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update purchase order"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update purchase order"
      );
    }
  }

  return (
    <>
      <ModulePage
        title="Procurement"
        description="Manage suppliers, purchase orders, approvals, and goods receiving."
        icon={ShoppingCart}
        actionLabel="Create Purchase Order"
        onAction={() => setShowModal(true)}
      >
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Pending Orders"
            value={pendingCount}
            icon={ClipboardList}
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Ordered"
            value={orderedCount}
            icon={Truck}
          />

          <SummaryCard
            title="Purchase Value"
            value={`₹${totalPurchaseValue.toLocaleString(
              "en-IN"
            )}`}
            icon={PackageCheck}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Orders */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Purchase Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Create, approve, order, and receive purchase orders.
              </p>
            </div>

            <input
              type="text"
              placeholder="Search purchase orders..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 sm:w-72"
            />
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading purchase orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              onAdd={() => setShowModal(true)}
            />
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
                      Amount
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={order._id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-medium text-white">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {new Date(
                              order.orderDate
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {order.supplierName}
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-slate-300">
                            {order.items.length}{" "}
                            product
                            {order.items.length !==
                            1
                              ? "s"
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {order.items.reduce(
                              (sum, item) =>
                                sum +
                                item.quantity,
                              0
                            )}{" "}
                            units
                          </p>
                        </td>

                        <td className="px-6 py-5 font-medium text-white">
                          ₹
                          {order.totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={
                              order.paymentStatus
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            status={order.status}
                          />
                        </td>

                        <td className="px-6 py-5">
                          <OrderAction
                            order={order}
                            onAction={updateOrder}
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ModulePage>

      {showModal && (
        <CreatePurchaseOrderModal
          suppliers={suppliers}
          products={products}
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            await loadData();
          }}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary Card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {title}
        </p>

        <Icon
          size={17}
          className="text-violet-400"
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Draft:
      "bg-slate-800 text-slate-400",
    Pending:
      "bg-amber-950 text-amber-400",
    Approved:
      "bg-blue-950 text-blue-400",
    Ordered:
      "bg-violet-950 text-violet-400",
    Received:
      "bg-emerald-950 text-emerald-400",
    Cancelled:
      "bg-red-950 text-red-400",
    Paid:
      "bg-emerald-950 text-emerald-400",
    Partial:
      "bg-amber-950 text-amber-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-800 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Action                                                               */
/* -------------------------------------------------------------------------- */

function OrderAction({
  order,
  onAction,
}: {
  order: PurchaseOrder;
  onAction: (
    orderId: string,
    action:
      | "approve"
      | "order"
      | "receive"
  ) => Promise<void>;
}) {
  if (order.status === "Pending") {
    return (
      <button
        type="button"
        onClick={() =>
          onAction(
            order._id,
            "approve"
          )
        }
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
      >
        Approve
      </button>
    );
  }

  if (order.status === "Approved") {
    return (
      <button
        type="button"
        onClick={() =>
          onAction(
            order._id,
            "order"
          )
        }
        className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700"
      >
        Mark Ordered
      </button>
    );
  }

  if (order.status === "Ordered") {
    return (
      <button
        type="button"
        onClick={() =>
          onAction(
            order._id,
            "receive"
          )
        }
        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
      >
        Receive
      </button>
    );
  }

  if (order.status === "Received") {
    return (
      <span className="text-xs text-emerald-400">
        Completed
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-600">
      —
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <ShoppingCart
        size={38}
        className="mx-auto text-slate-700"
      />

      <h3 className="mt-4 font-medium text-white">
        No purchase orders found
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        Create your first purchase order.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus size={16} />
        Create Purchase Order
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create Purchase Order Modal                                                */
/* -------------------------------------------------------------------------- */

function CreatePurchaseOrderModal({
  suppliers,
  products,
  onClose,
  onCreated,
}: {
  suppliers: Supplier[];
  products: Product[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [supplierId, setSupplierId] =
    useState("");

  const [items, setItems] = useState<
    OrderLine[]
  >([{ ...emptyLine }]);

  const [tax, setTax] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item.quantity) *
          Number(item.unitPrice)
      );
    },
    0
  );

  const total = subtotal + Number(tax || 0);

  function updateItem(
    index: number,
    field: keyof OrderLine,
    value: string | number
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function selectProduct(
    index: number,
    productId: string
  ) {
    const product = products.find(
      (item) => item._id === productId
    );

    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              unitPrice:
                product?.costPrice ??
                product?.price ??
                0,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { ...emptyLine },
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!supplierId) {
      setError(
        "Please select a supplier."
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !item.productId ||
          item.quantity <= 0 ||
          item.unitPrice < 0
      )
    ) {
      setError(
        "Please complete all product lines with valid quantities and prices."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/purchase-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            supplierId,
            items,
            tax: Number(tax) || 0,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create purchase order"
        );
      }

      await onCreated();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create purchase order."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create Purchase Order
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a new order for a supplier.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Supplier */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Supplier
              <span className="ml-1 text-violet-400">
                *
              </span>
            </label>

            <select
              required
              value={supplierId}
              onChange={(event) =>
                setSupplierId(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="">
                Select supplier
              </option>

              {suppliers
                .filter(
                  (supplier) =>
                    supplier.status ===
                    "Active"
                )
                .map((supplier) => (
                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.companyName} (
                    {supplier.supplierId})
                  </option>
                ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Order Items
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Select products and quantities.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                <Plus size={15} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map(
                (item, index) => {
                  const product =
                    products.find(
                      (product) =>
                        product._id ===
                        item.productId
                    );

                  const lineTotal =
                    Number(item.quantity) *
                    Number(item.unitPrice);

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="grid gap-4 lg:grid-cols-[1fr_140px_120px_120px_auto] lg:items-end">
                        {/* Product */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-500">
                            Product
                          </label>

                          <select
                            required
                            value={
                              item.productId
                            }
                            onChange={(
                              event
                            ) =>
                              selectProduct(
                                index,
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                          >
                            <option value="">
                              Select product
                            </option>

                            {products.map(
                              (
                                product
                              ) => (
                                <option
                                  key={
                                    product._id
                                  }
                                  value={
                                    product._id
                                  }
                                >
                                  {
                                    product.name
                                  }{" "}
                                  (
                                  {
                                    product.sku
                                  }
                                  )
                                </option>
                              )
                            )}
                          </select>

                          {product && (
                            <p className="mt-1 text-xs text-slate-600">
                              Current stock:{" "}
                              {
                                product.stockQuantity
                              }
                            </p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-500">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "quantity",
                                Number(
                                  event.target
                                    .value
                                )
                              )
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-500">
                            Unit Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.unitPrice
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "unitPrice",
                                Number(
                                  event.target
                                    .value
                                )
                              )
                            }
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>

                        {/* Total */}
                        <div>
                          <label className="mb-2 block text-xs font-medium text-slate-500">
                            Total
                          </label>

                          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm font-medium text-white">
                            ₹
                            {lineTotal.toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          disabled={
                            items.length ===
                            1
                          }
                          className="rounded-lg border border-slate-800 p-2.5 text-slate-500 hover:bg-red-950 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <X size={17} />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-white">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Tax
                </span>

                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(event) =>
                    setTax(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-right text-sm text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">
                    Total
                  </span>

                  <span className="text-lg font-bold text-violet-400">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}