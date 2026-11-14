"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

interface Product {
  _id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  warehouse: string;
  supplier?: string;
  isActive: boolean;
}

interface ProductForm {
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  warehouse: string;
  supplier: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const emptyForm: ProductForm = {
  sku: "",
  name: "",
  category: "",
  brand: "",
  description: "",
  price: 0,
  costPrice: 0,
  stockQuantity: 0,
  reorderLevel: 10,
  warehouse: "",
  supplier: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [suppliers, setSuppliers] = useState<
    {
      supplierId: string;
      companyName: string;
    }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadProducts() {
    try {
      

      const response = await fetch(
        `${API_URL}/api/products`
      );

      setLoading(true);
      setError("");

      if (!response.ok) {
        throw new Error(
          "Failed to fetch products"
        );
      }

      const result = await response.json();

      setProducts(result.data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load products. Make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }


  
  useEffect(() => {
    let cancelled = false;

    async function initializeProducts() {
      try {
        const [productsResponse, suppliersResponse] = await Promise.all([
          fetch(`${API_URL}/api/products`, { cache: "no-store" }),
          fetch(`${API_URL}/api/suppliers`, { cache: "no-store" }),
        ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const productsResult = await productsResponse.json();

        if (!cancelled) {
          setProducts(productsResult.data ?? []);
        }

        if (suppliersResponse.ok) {
          const suppliersResult = await suppliersResponse.json();

          if (!cancelled) {
            setSuppliers(
              (suppliersResult.data ?? []).map(
                (supplier: {
                  supplierId: string;
                  companyName: string;
                }) => ({
                  supplierId: supplier.supplierId,
                  companyName: supplier.companyName,
                })
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to load products:", error);

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeProducts();

    return () => {
      cancelled = true;
    };
  }, []);


  const filteredProducts = products.filter(
    (product) => {
      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) {
        return true;
      }

      return (
        product.sku
          .toLowerCase()
          .includes(searchText) ||
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.category
          .toLowerCase()
          .includes(searchText) ||
        product.brand
          .toLowerCase()
          .includes(searchText) ||
        product.warehouse
          .toLowerCase()
          .includes(searchText) ||
        product.supplier
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  const lowStockCount = products.filter(
    (product) =>
      product.stockQuantity <=
      product.reorderLevel
  ).length;

  const totalStockValue = products.reduce(
    (sum, product) =>
      sum +
      product.costPrice * product.stockQuantity,
    0
  );

  return (
    <>
      <ModulePage
        title="Products"
        description="Manage products, pricing, stock levels, and warehouses."
        icon={Package}
        actionLabel="Add Product"
        onAction={() => setShowModal(true)}
      >
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Products"
            value={products.length}
          />

          <SummaryCard
            title="Active Products"
            value={
              products.filter(
                (product) => product.isActive
              ).length
            }
          />

          <SummaryCard
            title="Low Stock"
            value={lowStockCount}
            warning={lowStockCount > 0}
          />

          <SummaryCard
            title="Inventory Value"
            value={`₹${totalStockValue.toLocaleString(
              "en-IN"
            )}`}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Product Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Product Catalog
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                View and manage your products.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 sm:w-72"
            />
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              onAdd={() => setShowModal(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/60">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-400">
                      Product
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Price
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Stock
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Warehouse
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Supplier
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const isLowStock =
                        product.stockQuantity <=
                        product.reorderLevel;

                      return (
                        <tr
                          key={product._id}
                          className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                        >
                          {/* Product */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
                                <Package
                                  size={18}
                                />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {product.sku}
                                  {" • "}
                                  {product.brand}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-5">
                            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-5">
                            <p className="font-medium text-white">
                              ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Cost ₹
                              {product.costPrice.toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              {isLowStock ? (
                                <AlertTriangle
                                  size={15}
                                  className="text-amber-400"
                                />
                              ) : (
                                <CheckCircle2
                                  size={15}
                                  className="text-emerald-400"
                                />
                              )}

                              <div>
                                <p className="font-medium text-slate-300">
                                  {
                                    product.stockQuantity
                                  }
                                </p>

                                <p className="text-xs text-slate-600">
                                  Reorder at{" "}
                                  {
                                    product.reorderLevel
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Warehouse */}
                          <td className="px-6 py-5 text-slate-400">
                            {product.warehouse}
                          </td>

                          {/* Supplier */}
                          <td className="px-6 py-5 text-slate-400">
                            {product.supplier ||
                              "—"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                product.isActive
                                  ? "bg-emerald-950 text-emerald-400"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {product.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ModulePage>

      {showModal && (
        <CreateProductModal
          suppliers={suppliers}
          onClose={() => setShowModal(false)}
          onCreated={async () => {
            setShowModal(false);
            await loadProducts();
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
  warning = false,
}: {
  title: string;
  value: number | string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          warning
            ? "text-amber-400"
            : "text-white"
        }`}
      >
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
      <Package
        size={38}
        className="mx-auto text-slate-700"
      />

      <h3 className="mt-4 font-medium text-white">
        No products found
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        Add your first product to start managing inventory.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        <Plus size={16} />
        Add Product
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Create Product Modal                                                       */
/* -------------------------------------------------------------------------- */

function CreateProductModal({
  suppliers,
  onClose,
  onCreated,
}: {
  suppliers: {
    supplierId: string;
    companyName: string;
  }[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof ProductForm,
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
      !form.sku ||
      !form.name ||
      !form.category ||
      !form.brand ||
      !form.warehouse
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    if (
      form.price < 0 ||
      form.costPrice < 0 ||
      form.stockQuantity < 0 ||
      form.reorderLevel < 0
    ) {
      setError(
        "Price, stock, and reorder values cannot be negative."
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            supplier:
              form.supplier || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create product"
        );
      }

      await onCreated();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create product."
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
              Add Product
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a product to your inventory catalog.
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

          {/* Product information */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Product Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="SKU"
                required
                value={form.sku}
                placeholder="LAP-001"
                onChange={(value) =>
                  updateField("sku", value)
                }
              />

              <FormInput
                label="Product Name"
                required
                value={form.name}
                placeholder="Dell Latitude 5450"
                onChange={(value) =>
                  updateField("name", value)
                }
              />

              <FormInput
                label="Category"
                required
                value={form.category}
                placeholder="Laptops"
                onChange={(value) =>
                  updateField(
                    "category",
                    value
                  )
                }
              />

              <FormInput
                label="Brand"
                required
                value={form.brand}
                placeholder="Dell"
                onChange={(value) =>
                  updateField(
                    "brand",
                    value
                  )
                }
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Description
              </label>

              <textarea
                value={form.description}
                placeholder="Product description..."
                rows={3}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Pricing
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Selling Price"
                required
                value={form.price}
                onChange={(value) =>
                  updateField("price", value)
                }
              />

              <NumberInput
                label="Cost Price"
                required
                value={form.costPrice}
                onChange={(value) =>
                  updateField(
                    "costPrice",
                    value
                  )
                }
              />
            </div>
          </div>

          {/* Inventory */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Inventory
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Stock Quantity"
                required
                value={form.stockQuantity}
                onChange={(value) =>
                  updateField(
                    "stockQuantity",
                    value
                  )
                }
              />

              <NumberInput
                label="Reorder Level"
                required
                value={form.reorderLevel}
                onChange={(value) =>
                  updateField(
                    "reorderLevel",
                    value
                  )
                }
              />

              <FormInput
                label="Warehouse"
                required
                value={form.warehouse}
                placeholder="Chennai Warehouse"
                onChange={(value) =>
                  updateField(
                    "warehouse",
                    value
                  )
                }
              />

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Supplier
                </label>

                <select
                  value={form.supplier}
                  onChange={(event) =>
                    updateField(
                      "supplier",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">
                    No supplier
                  </option>

                  {suppliers.map(
                    (supplier) => (
                      <option
                        key={
                          supplier.supplierId
                        }
                        value={
                          supplier.companyName
                        }
                      >
                        {supplier.companyName} (
                        {
                          supplier.supplierId
                        }
                        )
                      </option>
                    )
                  )}
                </select>
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
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text Input                                                                 */
/* -------------------------------------------------------------------------- */

function FormInput({
  label,
  value,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
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
        type="text"
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

/* -------------------------------------------------------------------------- */
/* Number Input                                                               */
/* -------------------------------------------------------------------------- */

function NumberInput({
  label,
  value,
  required = false,
  onChange,
}: {
  label: string;
  value: number;
  required?: boolean;
  onChange: (value: number) => void;
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
        type="number"
        min="0"
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
      />
    </div>
  );
}