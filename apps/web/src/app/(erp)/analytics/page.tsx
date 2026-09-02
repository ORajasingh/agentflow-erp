import {
  Activity,
  BarChart3,
  CircleDollarSign,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const monthlySales = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 71 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 84 },
  { month: "May", value: 91 },
  { month: "Jun", value: 108 },
  { month: "Jul", value: 116 },
  { month: "Aug", value: 124 },
];

const metrics = [
  {
    title: "Revenue Growth",
    value: "+18.7%",
    description: "Compared with previous quarter",
    icon: TrendingUp,
  },
  {
    title: "Sales Conversion",
    value: "24.8%",
    description: "+3.2% this month",
    icon: ShoppingCart,
  },
  {
    title: "Inventory Turnover",
    value: "6.4x",
    description: "Healthy inventory movement",
    icon: PackageSearch,
  },
  {
    title: "Operating Margin",
    value: "18.2%",
    description: "+2.1% this quarter",
    icon: CircleDollarSign,
  },
];

export default function AnalyticsPage() {
  const maxValue = Math.max(...monthlySales.map((item) => item.value));

  return (
    <ModulePage
      title="Analytics"
      description="Monitor enterprise performance, trends, and business intelligence."
      icon={BarChart3}
      actionLabel="Generate Report"
    >
      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {metric.title}
                </p>

                <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {metric.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sales chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Revenue Trend
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Monthly revenue performance
              </p>
            </div>

            <Activity size={20} className="text-violet-400" />
          </div>

          <div className="mt-8 flex h-64 items-end gap-3">
            {monthlySales.map((item) => {
              const height = (item.value / maxValue) * 100;

              return (
                <div
                  key={item.month}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-700 to-blue-500 transition hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${item.month}: ₹${item.value}L`}
                    />
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Analytics */}
        <div className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
              <TrendingUp size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                AI Analysis
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Automated business interpretation
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-violet-400">
                Revenue
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                Revenue has maintained a positive growth trend
                during the last three months.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-violet-400">
                Sales
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                Sales conversion has improved, indicating stronger
                customer purchasing intent.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-violet-400">
                Recommendation
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                Maintain current inventory levels while increasing
                stock for high-demand products.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business performance */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Business Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current enterprise health indicators
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Healthy
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-500">
              Sales Performance
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                87%
              </span>

              <span className="text-xs text-emerald-400">
                +8.4%
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full w-[87%] rounded-full bg-violet-600" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-500">
              Inventory Health
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                82%
              </span>

              <span className="text-xs text-emerald-400">
                +4.1%
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full w-[82%] rounded-full bg-blue-600" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs text-slate-500">
              Financial Health
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                91%
              </span>

              <span className="text-xs text-emerald-400">
                +6.8%
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full w-[91%] rounded-full bg-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}