import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  FileText,
  Wallet,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const transactions = [
  {
    id: "INV-1001",
    description: "Dell Technologies Purchase",
    type: "Expense",
    category: "Procurement",
    amount: "₹27.84L",
    status: "Pending",
  },
  {
    id: "INV-1002",
    description: "ABC Electronics Sales",
    type: "Income",
    category: "Sales",
    amount: "₹9.60L",
    status: "Paid",
  },
  {
    id: "INV-1003",
    description: "Office Infrastructure",
    type: "Expense",
    category: "Operations",
    amount: "₹2.45L",
    status: "Paid",
  },
  {
    id: "INV-1004",
    description: "TechWorld Solutions",
    type: "Income",
    category: "Sales",
    amount: "₹6.24L",
    status: "Paid",
  },
];

const summary = [
  {
    title: "Total Revenue",
    value: "₹12.40L",
    change: "+12.5%",
    icon: ArrowUpRight,
  },
  {
    title: "Total Expenses",
    value: "₹7.82L",
    change: "+4.2%",
    icon: ArrowDownRight,
  },
  {
    title: "Net Profit",
    value: "₹4.58L",
    change: "+18.7%",
    icon: Wallet,
  },
  {
    title: "Pending Invoices",
    value: "24",
    change: "Needs attention",
    icon: FileText,
  },
];

export default function FinancePage() {
  return (
    <ModulePage
      title="Finance"
      description="Monitor revenue, expenses, invoices, budgets, and financial performance."
      icon={CircleDollarSign}
      actionLabel="Create Invoice"
    >
      {/* Financial Summary */}
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

              <p
                className={`mt-2 text-xs font-medium ${
                  item.title === "Pending Invoices"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {item.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Budget Overview */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Department Budgets
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current budget utilization
              </p>
            </div>

            <CreditCard size={20} className="text-violet-400" />
          </div>

          <div className="mt-6 space-y-5">
            {[
              {
                name: "Procurement",
                used: "₹27.8L",
                total: "₹40L",
                percent: 69,
              },
              {
                name: "Operations",
                used: "₹18.2L",
                total: "₹30L",
                percent: 61,
              },
              {
                name: "Marketing",
                used: "₹8.4L",
                total: "₹15L",
                percent: 56,
              },
              {
                name: "Human Resources",
                used: "₹12.1L",
                total: "₹20L",
                percent: 61,
              },
            ].map((budget) => (
              <div key={budget.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {budget.name}
                  </span>

                  <span className="text-xs text-slate-500">
                    {budget.used} / {budget.total}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                    style={{ width: `${budget.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Financial Insight */}
        <div className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
              <CircleDollarSign size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                AI Financial Insight
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Intelligent financial analysis
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm leading-6 text-slate-300">
              Procurement expenses are currently the largest
              spending category. The system recommends reviewing
              supplier pricing before the next purchasing cycle.
            </p>

            <div className="mt-5 rounded-xl border border-violet-900/50 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                Recommendation
              </p>

              <p className="mt-1 text-sm font-medium text-violet-300">
                Review high-value supplier contracts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Recent Transactions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest financial activity across the organization.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">
                  ID
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Description
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Type
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Category
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
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {transaction.id}
                  </td>

                  <td className="px-6 py-4 font-medium text-white">
                    {transaction.description}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        transaction.type === "Income"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {transaction.category}
                  </td>

                  <td className="px-6 py-4 font-semibold text-white">
                    {transaction.amount}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        transaction.status === "Paid"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}