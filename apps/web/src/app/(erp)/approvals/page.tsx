
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import ModulePage from "@/components/layout/ModulePage";

type OrderStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Ordered"
  | "Received"
  | "Cancelled";

interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplierName: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt?: string;
  orderDate?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: PurchaseOrder[] | PurchaseOrder;
}

const statusStyles: Record<OrderStatus, string> = {
  Draft: "bg-slate-800 text-slate-300",
  Pending: "bg-amber-950 text-amber-400",
  Approved: "bg-emerald-950 text-emerald-400",
  Ordered: "bg-blue-950 text-blue-400",
  Received: "bg-violet-950 text-violet-400",
  Cancelled: "bg-red-950 text-red-400",
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ApprovalsPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
  "Pending" | "All" | "Approved" | "Rejected"
>("Pending");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/purchase-orders", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load purchase orders."
        );
      }

      setOrders(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load purchase orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const timerId = window.setTimeout(() => {
    void loadOrders();
  }, 0);

  return () => {
    window.clearTimeout(timerId);
  };
}, [loadOrders]);

  async function updateOrder(
    order: PurchaseOrder,
    action: "approve" | "reject"
  ) {
    const actionLabel =
      action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} purchase order ${order.orderNumber} for ${formatMoney(order.totalAmount)}?`
    );

    if (!confirmed) return;

    try {
      setWorkingId(order._id);
      setError("");
      setNotice("");

      const response = await fetch(
        `/api/purchase-orders/${encodeURIComponent(order._id)}/${action}`,
        {
          method: "PATCH",
          cache: "no-store",
        }
      );

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${actionLabel} purchase order.`
        );
      }

      setNotice(
        result.message ||
          `Purchase order ${order.orderNumber} ${action === "approve" ? "approved" : "rejected"} successfully.`
      );

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${actionLabel} purchase order.`
      );
    } finally {
      setWorkingId(null);
    }
  }

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const approvedCount = orders.filter(
    (order) => order.status === "Approved"
  ).length;

  const rejectedCount = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  );

  const visibleOrders = orders.filter((order) => {
  if (filter === "All") return true;
  if (filter === "Rejected") return order.status === "Cancelled";

  return order.status === filter;
});

  return (
    <ModulePage
      title="Approvals"
      description="Review AI-generated purchase orders and approve or reject them before execution."
      icon={FileCheck2}
      actionLabel="Refresh"
      onAction={loadOrders}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Pending",
            count: pendingCount,
            description: "Requires your attention",
            icon: Clock3,
            color: "text-amber-400",
          },
          {
            label: "Approved",
            count: approvedCount,
            description: "Approved purchase orders",
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
          {
            label: "Rejected",
            count: rejectedCount,
            description: "Cancelled purchase orders",
            icon: XCircle,
            color: "text-red-400",
          },
          {
            label: "Total Orders",
            count: orders.length,
            description: "From the database",
            icon: ShieldCheck,
            color: "text-violet-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {stat.label}
                </p>
                <Icon size={19} className={stat.color} />
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {stat.count}
              </p>

              <p className={`mt-2 text-xs ${stat.color}`}>
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-violet-900/50 bg-violet-950/10 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={23}
            className="mt-1 shrink-0 text-violet-400"
          />
          <div>
            <h2 className="font-semibold text-white">
              Human-in-the-Loop Control
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              AI-created purchase orders remain pending until an
              authorized user reviews and approves them. Approval
              actions are saved through the backend.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-300"
        >
          {notice}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="font-semibold text-white">
              Purchase Order Approval Queue
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {pendingCount} order(s) waiting for approval
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
                </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-6 py-3">
          {(["Pending", "All", "Approved", "Rejected"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? "bg-violet-600 text-white"
                    : "border border-slate-700 text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item === "Rejected" ? "Rejected" : item}
                {item === "Pending" && ` (${pendingCount})`}
              </button>
            )
          )}
                </div>


        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading purchase orders...
          </div>
                ) : visibleOrders.length === 0 ? (
                    <div className="p-10 text-center">
            <FileCheck2
              size={32}
              className="mx-auto text-slate-600"
            />

            <p className="mt-3 font-medium text-white">
              {filter === "Pending"
                ? "No pending approvals"
                : `No ${filter.toLowerCase()} purchase orders`}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {filter === "Pending"
                ? "All purchase orders have been reviewed. New AI-generated orders will appear here after confirmation."
                : "Try another filter to view purchase orders."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
                        {visibleOrders.map((order) => {
              const isPending = order.status === "Pending";
              const isWorking = workingId === order._id;

              return (
                <div
                  key={order._id}
                  className="p-5 sm:p-6 transition hover:bg-slate-900/30"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending ? (
                          <AlertTriangle
                            size={18}
                            className="text-amber-400"
                          />
                        ) : (
                          <CheckCircle2
                            size={18}
                            className="text-slate-400"
                          />
                        )}

                        <h3 className="font-semibold text-white">
                          {order.orderNumber}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status] || statusStyles.Draft}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        Supplier: {order.supplierName || "Unknown supplier"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Created:{" "}
                        {formatDate(order.createdAt || order.orderDate)}
                      </p>

                      <div className="mt-3 space-y-1">
                        {(order.items || []).map((item, index) => (
                          <p
                            key={`${order._id}-${index}`}
                            className="text-xs text-slate-400"
                          >
                            {item.productName} × {item.quantity}
                            {" — "}
                            {formatMoney(item.total ?? item.quantity * item.unitPrice)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:min-w-56">
                      <div>
                        <p className="text-xs text-slate-500">
                          Order total
                        </p>
                        <p className="mt-1 text-lg font-bold text-white">
                          {formatMoney(order.totalAmount)}
                        </p>
                      </div>

                      {isPending ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              void updateOrder(order, "approve")
                            }
                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isWorking ? "Saving..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              void updateOrder(order, "reject")
                            }
                            className="flex-1 rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No action required
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && pendingOrders.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-3 text-xs text-slate-500">
            Approving or rejecting an order updates its database status.
          </div>
        )}
      </div>
    </ModulePage>
  );
}
