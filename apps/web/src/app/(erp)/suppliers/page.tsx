"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  X,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

interface Supplier {
  _id: string;
  supplierId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  rating: number;
  totalOrders: number;
  totalPurchaseValue: number;
  status: "Active" | "Inactive" | "Pending";
}

interface SupplierForm {
  supplierId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  city: string;
  country: string;
  rating: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-950 text-emerald-400",
  Inactive: "bg-slate-800 text-slate-400",
  Pending: "bg-amber-950 text-amber-400",
};

const emptyForm: SupplierForm = {
  supplierId: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  category: "",
  address: "",
  city: "",
  country: "India",
  rating: 0,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadSuppliers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/suppliers`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch suppliers"
        );
      }

      const result = await response.json();

      setSuppliers(result.data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load suppliers. Make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (supplier) => {
      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) {
        return true;
      }

      return (
        supplier.supplierId
          .toLowerCase()
          .includes(searchText) ||
        supplier.companyName
          .toLowerCase()
          .includes(searchText) ||
        supplier.contactPerson
          .toLowerCase()
          .includes(searchText) ||
        supplier.email
          .toLowerCase()
          .includes(searchText) ||
        supplier.category
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <>
      <ModulePage
        title="Suppliers"
        description="Manage suppliers, contacts, and procurement relationships."
        icon={Building2}
        actionLabel="Add Supplier"
        onAction={() => setShowModal(true)}
      >
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Suppliers"
            value={suppliers.length}
          />

          <SummaryCard
            title="Active Suppliers"
            value={
              suppliers.filter(
                (supplier) =>
                  supplier.status === "Active"
              ).length
            }
          />

          <SummaryCard
            title="Pending Suppliers"
            value={
              suppliers.filter(
                (supplier) =>
                  supplier.status === "Pending"
              ).length
            }
          />

          <SummaryCard
            title="Total Purchases"
            value={`₹${suppliers
              .reduce(
                (sum, supplier) =>
                  sum +
                  supplier.totalPurchaseValue,
                0
              )
              .toLocaleString("en-IN")}`}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Supplier list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Supplier Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and manage your procurement partners.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search suppliers..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading suppliers...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <EmptyState
              onAdd={() => setShowModal(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/60">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-400">
                      Supplier
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Contact
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Rating
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Orders
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Purchase Value
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier._id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                      >
                        {/* Supplier */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
                              <Building2 size={18} />
                            </div>

                            <div>
                              <p className="font-medium text-white">
                                {supplier.companyName}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {supplier.supplierId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <p className="text-slate-300">
                            {supplier.contactPerson}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail size={12} />
                            {supplier.email}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone size={12} />
                            {supplier.phone}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                            {supplier.category ||
                              "General"}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="fill-current text-amber-400"
                            />

                            <span className="text-slate-300">
                              {supplier.rating.toFixed(
                                1
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="px-6 py-5 text-slate-400">
                          {supplier.totalOrders}
                        </td>

                        {/* Purchase value */}
                        <td className="px-6 py-5 font-medium text-white">
                          ₹
                          {supplier.totalPurchaseValue.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusClasses[
                                supplier.status
                              ] ||
                              statusClasses.Inactive
                            }`}
                          >
                            {supplier.status}
                          </span>
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
        <CreateSupplierModal
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            await loadSuppliers();
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
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
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
      <Building2
        size={38}
        className="mx-auto text-slate-700"
      />

      <h3 className="mt-4 font-medium text-white">
        No suppliers found
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        Add your first supplier to start procurement.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus size={16} />
        Add Supplier
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create Supplier Modal                                                      */
/* -------------------------------------------------------------------------- */

function CreateSupplierModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form, setForm] =
    useState<SupplierForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof SupplierForm,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.supplierId ||
      !form.companyName ||
      !form.contactPerson ||
      !form.email ||
      !form.phone
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/suppliers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create supplier"
        );
      }

      await onCreated();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create supplier."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Add Supplier
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a new supplier to your enterprise.
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

          {/* Basic information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Basic Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Supplier ID"
                required
                value={form.supplierId}
                placeholder="SUP-001"
                onChange={(value) =>
                  updateField(
                    "supplierId",
                    value
                  )
                }
              />

              <FormInput
                label="Company Name"
                required
                value={form.companyName}
                placeholder="ABC Technologies"
                onChange={(value) =>
                  updateField(
                    "companyName",
                    value
                  )
                }
              />

              <FormInput
                label="Contact Person"
                required
                value={form.contactPerson}
                placeholder="Raj Kumar"
                onChange={(value) =>
                  updateField(
                    "contactPerson",
                    value
                  )
                }
              />

              <FormInput
                label="Category"
                value={form.category}
                placeholder="Electronics"
                onChange={(value) =>
                  updateField(
                    "category",
                    value
                  )
                }
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Contact Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Email"
                required
                type="email"
                value={form.email}
                placeholder="supplier@example.com"
                onChange={(value) =>
                  updateField("email", value)
                }
              />

              <FormInput
                label="Phone"
                required
                value={form.phone}
                placeholder="9876543210"
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <FormInput
                label="Address"
                value={form.address}
                placeholder="12 Industrial Road"
                onChange={(value) =>
                  updateField(
                    "address",
                    value
                  )
                }
              />

              <FormInput
                label="City"
                value={form.city}
                placeholder="Chennai"
                onChange={(value) =>
                  updateField("city", value)
                }
              />

              <FormInput
                label="Country"
                value={form.country}
                placeholder="India"
                onChange={(value) =>
                  updateField(
                    "country",
                    value
                  )
                }
              />

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Rating
                </label>

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(event) =>
                    updateField(
                      "rating",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                />
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
                ? "Saving..."
                : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Input                                                                 */
/* -------------------------------------------------------------------------- */

function FormInput({
  label,
  value,
  placeholder,
  required = false,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-violet-500"
      />
    </div>
  );
}