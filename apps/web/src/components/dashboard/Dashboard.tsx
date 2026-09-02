import {
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  PackageSearch,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

import StatCard from "./StatCard";

const insights = [
  {
    title: "Inventory Risk",
    description:
      "5 products may reach critical stock levels within the next 7 days.",
    type: "warning",
  },
  {
    title: "Sales Opportunity",
    description:
      "Laptop demand has increased significantly compared with last month.",
    type: "positive",
  },
  {
    title: "Supplier Risk",
    description:
      "Supplier B delivery performance has decreased over the last 30 days.",
    type: "warning",
  },
];

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-violet-600">
            Monday, August 17, 2026
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Good morning, Admin
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening across your enterprise today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="₹12.4L"
            change="+12.5% from last month"
            icon={CircleDollarSign}
          />

          <StatCard
            title="Total Orders"
            value="1,284"
            change="+8.2% from last month"
            icon={ShoppingCart}
          />

          <StatCard
            title="Employees"
            value="248"
            change="+4 new this month"
            icon={Users}
          />

          <StatCard
            title="Low Stock Items"
            value="17"
            change="Needs attention"
            icon={PackageSearch}
            positive={false}
          />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* AI Insights */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-violet-600"
                  />

                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    AI Business Insights
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Generated from enterprise data
                </p>
              </div>

              <span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                AI Powered
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      insight.type === "warning"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                    }`}
                  >
                    {insight.type === "warning" ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {insight.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Approvals */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Pending Approvals
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Actions requiring your attention
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Purchase Order
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Dell Latitude • 58 units
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    ₹27.84L
                  </span>

                  <button
                    type="button"
                    className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700"
                  >
                    Review
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Budget Adjustment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Procurement department
                </p>

                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Review Request
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}