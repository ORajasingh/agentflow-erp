import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const purchaseOrders = [
  {
    id: "PO-1001",
    supplier: "Dell Technologies",
    items: "Dell Latitude 5450",
    quantity: 58,
    amount: "₹27.84L",
    status: "Pending Approval",
  },
  {
    id: "PO-1002",
    supplier: "HP India",
    items: "HP ProBook 450",
    quantity: 40,
    amount: "₹20.80L",
    status: "Approved",
  },
  {
    id: "PO-1003",
    supplier: "Lenovo India",
    items: "ThinkPad E14",
    quantity: 25,
    amount: "₹13.50L",
    status: "Delivered",
  },
  {
    id: "PO-1004",
    supplier: "Logitech",
    items: "MX Master 3",
    quantity: 100,
    amount: "₹6.50L",
    status: "Processing",
  },
];

const suppliers = [
  {
    name: "Dell Technologies",
    reliability: "98%",
    delivery: "2 days",
    quality: "Excellent",
    score: "94%",
  },
  {
    name: "HP India",
    reliability: "95%",
    delivery: "3 days",
    quality: "Excellent",
    score: "91%",
  },
  {
    name: "Lenovo India",
    reliability: "93%",
    delivery: "3 days",
    quality: "Good",
    score: "87%",
  },
];

const summary = [
  {
    title: "Purchase Orders",
    value: "128",
    icon: ShoppingCart,
  },
  {
    title: "Pending Approval",
    value: "12",
    icon: Clock3,
  },
  {
    title: "Active Suppliers",
    value: "42",
    icon: Truck,
  },
  {
    title: "Delivered",
    value: "94",
    icon: CheckCircle2,
  },
];

export default function ProcurementPage() {
  return (
    <ModulePage
      title="Procurement"
      description="Manage suppliers, purchase orders, and purchasing workflows."
      icon={PackageCheck}
      actionLabel="Create Purchase Order"
    >
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Purchase Orders */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Purchase Orders
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Track purchasing activity and supplier orders.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">
                  PO Number
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Supplier
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Items
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Quantity
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Amount
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {order.id}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {order.supplier}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {order.items}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {order.quantity}
                  </td>

                  <td className="px-6 py-4 font-semibold text-white">
                    {order.amount}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-emerald-950 text-emerald-400"
                          : order.status === "Approved"
                            ? "bg-blue-950 text-blue-400"
                            : order.status === "Pending Approval"
                              ? "bg-amber-950 text-amber-400"
                              : "bg-violet-950 text-violet-400"
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
      </div>

      {/* Supplier Intelligence */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-900/50 bg-violet-950/10">
        <div className="border-b border-violet-900/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
              <PackageCheck size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Supplier Intelligence
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                AI-ready supplier comparison data
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div
              key={supplier.name}
              className="rounded-xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">
                  {supplier.name}
                </h3>

                <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-semibold text-emerald-400">
                  {supplier.score}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Reliability
                  </span>

                  <span className="text-slate-300">
                    {supplier.reliability}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="text-slate-300">
                    {supplier.delivery}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Quality
                  </span>

                  <span className="text-slate-300">
                    {supplier.quality}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500 hover:text-violet-400"
              >
                View Supplier
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModulePage>
  );
}