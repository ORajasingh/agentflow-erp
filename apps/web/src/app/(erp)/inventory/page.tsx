"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageSearch,
} from "lucide-react";
import { useEffect, useState } from "react";

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

const API_URL = "http://localhost:4000";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await response.json();

        setProducts(result.data ?? []);
      } catch (err) {
        console.error("Inventory fetch error:", err);
        setError("Unable to load inventory data");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Inventory statistics
  const totalProducts = products.length;

  const inStock = products.filter(
    (product) => product.stockQuantity > product.reorderLevel
  ).length;

  const lowStock = products.filter(
    (product) =>
      product.stockQuantity <= product.reorderLevel &&
      product.stockQuantity > 0
  ).length;

  const critical = products.filter(
    (product) => product.stockQuantity === 0
  ).length;

  const summary = [
    {
      title: "Total Products",
      value: String(totalProducts),
      icon: Boxes,
    },
    {
      title: "In Stock",
      value: String(inStock),
      icon: CheckCircle2,
    },
    {
      title: "Low Stock",
      value: String(lowStock),
      icon: AlertTriangle,
    },
    {
      title: "Critical Items",
      value: String(critical),
      icon: PackageSearch,
    },
  ];

  return (
    <ModulePage
      title="Inventory"
      description="Monitor stock levels, warehouses, and inventory movements."
      icon={Boxes}
      actionLabel="Add Product"
    >
      {/* Summary Cards */}
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

      {/* Loading State */}
      {loading && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />

          <p className="mt-4 text-sm text-slate-500">
            Loading inventory from MongoDB...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <AlertTriangle className="mx-auto text-red-400" size={24} />

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

      {/* Inventory Table */}
      {!loading && !error && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Inventory Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Live inventory data from MongoDB.
                </p>
              </div>

              <span className="rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-medium text-emerald-400">
                {products.length} Products
              </span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-10 text-center">
              <PackageSearch
                className="mx-auto text-slate-600"
                size={30}
              />

              <p className="mt-4 text-sm font-medium text-slate-400">
                No products found
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Add products to MongoDB or run the seed command.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/60">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-400">
                      SKU
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Product
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Brand
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Warehouse
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Stock
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Reorder Level
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Price
                    </th>

                    <th className="px-6 py-4 font-medium text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const status =
                      product.stockQuantity === 0
                        ? "Critical"
                        : product.stockQuantity <=
                            product.reorderLevel
                          ? "Low Stock"
                          : "In Stock";

                    return (
                      <tr
                        key={product._id}
                        className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                      >
                        {/* SKU */}
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {product.sku}
                        </td>

                        {/* Product */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {product.name}
                            </p>

                            {product.supplier && (
                              <p className="mt-1 text-[11px] text-slate-600">
                                Supplier: {product.supplier}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-slate-400">
                          {product.category}
                        </td>

                        {/* Brand */}
                        <td className="px-6 py-4 text-slate-400">
                          {product.brand}
                        </td>

                        {/* Warehouse */}
                        <td className="px-6 py-4 text-slate-400">
                          {product.warehouse}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">
                            {product.stockQuantity}
                          </span>
                        </td>

                        {/* Reorder Level */}
                        <td className="px-6 py-4 text-slate-400">
                          {product.reorderLevel}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-medium text-white">
                          ₹{product.price.toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              status === "In Stock"
                                ? "bg-emerald-950 text-emerald-400"
                                : status === "Low Stock"
                                  ? "bg-amber-950 text-amber-400"
                                  : "bg-red-950 text-red-400"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Intelligence */}
      {!loading && !error && products.length > 0 && (
        <div className="mt-6 rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-950 p-3 text-violet-400">
              <PackageSearch size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Inventory Intelligence
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Gideon can use this inventory data to identify
                low-stock products, detect critical shortages, and
                recommend procurement actions.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                  {lowStock} Low Stock
                </span>

                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                  {critical} Critical
                </span>

                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-violet-400">
                  AI Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  );
}