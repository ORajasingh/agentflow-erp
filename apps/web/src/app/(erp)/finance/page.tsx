"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

interface Transaction {
  _id: string;
  transactionId: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  reference?: string;
  paymentStatus: "Pending" | "Paid" | "Partial";
  paymentMethod?: string;
  transactionDate: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingIncome: number;
  pendingExpense: number;
  transactionCount: number;
}

export default function FinancePage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [summary, setSummary] =
    useState<Summary>({
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      pendingIncome: 0,
      pendingExpense: 0,
      transactionCount: 0,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    type: "Income",
    category: "Sales",
    description: "",
    amount: "",
    reference: "",
    paymentStatus: "Pending",
    paymentMethod: "Bank",
  });

  const fetchFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionsResponse, summaryResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/finance`, {
            cache: "no-store",
          }),

          fetch(`${API_URL}/api/finance/summary`, {
            cache: "no-store",
          }),
        ]);

      if (!transactionsResponse.ok) {
        throw new Error(
          "Failed to fetch transactions"
        );
      }

      if (!summaryResponse.ok) {
        throw new Error(
          "Failed to fetch summary"
        );
      }

      const transactionsData =
        await transactionsResponse.json();

      const summaryData =
        await summaryResponse.json();

      setTransactions(
        transactionsData.data || []
      );

      setSummary(
        summaryData.data || {
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          pendingIncome: 0,
          pendingExpense: 0,
          transactionCount: 0,
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the Finance API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/finance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            amount: Number(form.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create transaction"
        );
      }

      setForm({
        type: "Income",
        category: "Sales",
        description: "",
        amount: "",
        reference: "",
        paymentStatus: "Pending",
        paymentMethod: "Bank",
      });

      setShowForm(false);

      await fetchFinance();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create transaction"
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
              <CircleDollarSign size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Finance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage revenue, expenses and financial transactions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={fetchFinance}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              <Plus size={17} />
              Add Transaction
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(
              summary.totalIncome
            )}
            icon={TrendingUp}
            description="Total income"
          />

          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(
              summary.totalExpense
            )}
            icon={TrendingDown}
            description="Total expenses"
          />

          <SummaryCard
            title="Net Profit"
            value={formatCurrency(
              summary.netProfit
            )}
            icon={Wallet}
            description="Revenue minus expenses"
          />

          <SummaryCard
            title="Transactions"
            value={String(
              summary.transactionCount
            )}
            icon={CircleDollarSign}
            description="Total transactions"
          />

        </div>

        {/* Pending */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs text-slate-500">
              Pending Receivables
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-400">
              {formatCurrency(
                summary.pendingIncome
              )}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Income awaiting payment
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs text-slate-500">
              Pending Payables
            </p>

            <p className="mt-2 text-xl font-bold text-amber-400">
              {formatCurrency(
                summary.pendingExpense
              )}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Expenses awaiting payment
            </p>
          </div>

        </div>

        {/* Transactions */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="font-semibold text-white">
              Recent Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Track your latest financial activity.
            </p>
          </div>

          <div className="overflow-x-auto">

            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">

                <CircleDollarSign
                  size={32}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No financial transactions yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(true)
                  }
                  className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
                >
                  Add your first transaction
                </button>

              </div>
            ) : (
              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-800 bg-slate-900/60">
                  <tr>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Transaction
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Description
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Payment
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={
                          transaction._id
                        }
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                      >

                        <td className="px-6 py-4 font-medium text-white">
                          {
                            transaction.transactionId
                          }
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              transaction.type ===
                              "Income"
                                ? "bg-emerald-950 text-emerald-400"
                                : "bg-red-950 text-red-400"
                            }`}
                          >
                            {
                              transaction.type
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {
                            transaction.category
                          }
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {
                            transaction.description
                          }
                        </td>

                        <td
                          className={`px-6 py-4 font-medium ${
                            transaction.type ===
                            "Income"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.type ===
                          "Income"
                            ? "+"
                            : "-"}
                          {formatCurrency(
                            transaction.amount
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                            {
                              transaction.paymentStatus
                            }
                          </span>

                        </td>

                        <td className="px-6 py-4 text-slate-500">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>
            )}

          </div>
        </div>

      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">

              <div>
                <h2 className="font-semibold text-white">
                  Add Transaction
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Record income or expense.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs text-slate-400">
                    Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value,
                        category:
                          e.target.value ===
                          "Income"
                            ? "Sales"
                            : "Purchase",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="Income">
                      Income
                    </option>

                    <option value="Expense">
                      Expense
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    {form.type ===
                    "Income" ? (
                      <>
                        <option value="Sales">
                          Sales
                        </option>
                        <option value="Other">
                          Other
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="Purchase">
                          Purchase
                        </option>
                        <option value="Salary">
                          Salary
                        </option>
                        <option value="Rent">
                          Rent
                        </option>
                        <option value="Utilities">
                          Utilities
                        </option>
                        <option value="Other">
                          Other
                        </option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              <div>
                <label className="text-xs text-slate-400">
                  Description
                </label>

                <input
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Example: Laptop sales"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">
                  Amount
                </label>

                <input
                  required
                  min="0"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount:
                        e.target.value,
                    })
                  }
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">
                  Reference
                </label>

                <input
                  value={form.reference}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reference:
                        e.target.value,
                    })
                  }
                  placeholder="Optional order/invoice reference"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs text-slate-400">
                    Payment Status
                  </label>

                  <select
                    value={
                      form.paymentStatus
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentStatus:
                          e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Partial">
                      Partial
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400">
                    Payment Method
                  </label>

                  <select
                    value={
                      form.paymentMethod
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentMethod:
                          e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option value="Bank">
                      Bank
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save Transaction
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-950/50 text-violet-400">
          <Icon size={18} />
        </div>

      </div>

      <p className="mt-4 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>

    </div>
  );
}