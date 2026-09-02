"use client";

import {
  Building2,
  Mail,
  Phone,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ModulePage from "@/components/layout/ModulePage";

interface Customer {
  _id: string;
  customerId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  totalOrders: number;
  totalValue: number;
  status: "Active" | "Prospect" | "Inactive";
}

const API_URL = "http://localhost:4000";

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/customers`);

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const result = await response.json();

        setCustomers(result.data ?? []);
      } catch (err) {
        console.error("CRM fetch error:", err);
        setError("Unable to load customer data");
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const prospectCustomers = customers.filter(
    (customer) => customer.status === "Prospect"
  ).length;

  const totalCustomerValue = customers.reduce(
    (total, customer) => total + customer.totalValue,
    0
  );

  const averageCustomerValue =
    totalCustomers > 0
      ? totalCustomerValue / totalCustomers
      : 0;

  const summary = [
    {
      title: "Total Customers",
      value: String(totalCustomers),
      icon: Users,
    },
    {
      title: "Active Customers",
      value: String(activeCustomers),
      icon: UserPlus,
    },
    {
      title: "Total Customer Value",
      value: `₹${(totalCustomerValue / 10000000).toFixed(2)}Cr`,
      icon: TrendingUp,
    },
    {
      title: "Average Value",
      value: `₹${Math.round(
        averageCustomerValue / 100000
      ).toLocaleString("en-IN")}L`,
      icon: Star,
    },
  ];

  const highestValueCustomer = useMemo(() => {
    if (customers.length === 0) return null;

    return [...customers].sort(
      (a, b) => b.totalValue - a.totalValue
    )[0];
  }, [customers]);

  return (
    <ModulePage
      title="CRM"
      description="Manage customers, relationships, communication, and customer value."
      icon={Users}
      actionLabel="Add Customer"
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

      {/* Loading */}
      {loading && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

          <p className="mt-4 text-sm text-slate-500">
            Loading customers from MongoDB...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <AlertTriangle
            className="mx-auto text-red-400"
            size={24}
          />

          <p className="mt-3 text-sm font-medium text-red-400">
            {error}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Make sure the AgentFlow API is running on port 4000.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Customer Intelligence */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Customer Intelligence
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Real-time customer relationship signals
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">
                    Active Customers
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {activeCustomers}
                  </p>

                  <p className="mt-1 text-xs text-emerald-400">
                    Currently active
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">
                    Prospects
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {prospectCustomers}
                  </p>

                  <p className="mt-1 text-xs text-blue-400">
                    Potential customers
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs text-slate-500">
                    Total Orders
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    {customers.reduce(
                      (sum, customer) =>
                        sum + customer.totalOrders,
                      0
                    )}
                  </p>

                  <p className="mt-1 text-xs text-violet-400">
                    Across all customers
                  </p>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
                  <Star size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    AI Recommendation
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Customer opportunity
                  </p>
                </div>
              </div>

              {highestValueCustomer ? (
                <>
                  <p className="mt-6 text-sm leading-6 text-slate-300">
                    <span className="font-medium text-white">
                      {highestValueCustomer.companyName}
                    </span>{" "}
                    currently has the highest customer value in
                    the database.
                  </p>

                  <div className="mt-4 rounded-xl border border-violet-900/50 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Customer Value
                    </p>

                    <p className="mt-1 text-lg font-bold text-violet-400">
                      ₹
                      {highestValueCustomer.totalValue.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {highestValueCustomer.totalOrders} orders
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm text-slate-500">
                  No customer data available.
                </p>
              )}
            </div>
          </div>

          {/* Customer Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Customers
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Live customer data from MongoDB.
                </p>
              </div>

              <span className="rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-medium text-emerald-400">
                {customers.length} Customers
              </span>
            </div>

            {customers.length === 0 ? (
              <div className="p-10 text-center">
                <Users
                  className="mx-auto text-slate-600"
                  size={30}
                />

                <p className="mt-4 text-sm font-medium text-slate-400">
                  No customers found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/60">
                    <tr>
                      <th className="px-6 py-4 font-medium text-slate-400">
                        Customer
                      </th>

                      <th className="px-6 py-4 font-medium text-slate-400">
                        Contact
                      </th>

                      <th className="px-6 py-4 font-medium text-slate-400">
                        Communication
                      </th>

                      <th className="px-6 py-4 font-medium text-slate-400">
                        Orders
                      </th>

                      <th className="px-6 py-4 font-medium text-slate-400">
                        Customer Value
                      </th>

                      <th className="px-6 py-4 font-medium text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                      >
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-950 text-violet-400">
                              <Building2 size={17} />
                            </div>

                            <div>
                              <p className="font-medium text-white">
                                {customer.companyName}
                              </p>

                              <p className="mt-1 font-mono text-[10px] text-slate-600">
                                {customer.customerId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <p className="text-slate-300">
                            {customer.contactPerson}
                          </p>

                          {customer.industry && (
                            <p className="mt-1 text-[11px] text-slate-600">
                              {customer.industry}
                            </p>
                          )}
                        </td>

                        {/* Communication */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Mail size={13} />
                              {customer.email}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Phone size={13} />
                              {customer.phone}
                            </div>
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="px-6 py-4 text-slate-300">
                          {customer.totalOrders}
                        </td>

                        {/* Value */}
                        <td className="px-6 py-4 font-semibold text-white">
                          ₹
                          {customer.totalValue.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              customer.status === "Active"
                                ? "bg-emerald-950 text-emerald-400"
                                : customer.status === "Prospect"
                                  ? "bg-blue-950 text-blue-400"
                                  : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CRM Intelligence */}
          <div className="mt-6 rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-violet-950 p-3 text-violet-400">
                <TrendingUp size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  CRM Intelligence
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Gideon will use customer history, order values,
                  purchasing patterns, and relationship data to
                  identify valuable customers and sales
                  opportunities.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                    {activeCustomers} Active
                  </span>

                  <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-blue-400">
                    {prospectCustomers} Prospects
                  </span>

                  <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-violet-400">
                    AI Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ModulePage>
  );
}