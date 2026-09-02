"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  PackageSearch,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  SlidersHorizontal,
  X,
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

interface Supplier {
  _id: string;
  supplierId: string;
  companyName: string;
  status: "Active" | "Inactive" | "Pending";
}

interface StockMovement {
  _id: string;
  product: string;
  sku: string;
  productName: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<
    StockMovement[]
  >([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementLoading, setMovementLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [movementError, setMovementError] =
    useState("");

  // Adjustment modal
  const [adjustingProduct, setAdjustingProduct] =
    useState<Product | null>(null);

  const [showAddProduct, setShowAddProduct] =
  useState(false);

const [addingProduct, setAddingProduct] =
  useState(false);

const [productError, setProductError] =
  useState("");

const [productForm, setProductForm] = useState({
  sku: "",
  name: "",
  category: "",
  brand: "",
  description: "",
  price: "",
  costPrice: "",
  stockQuantity: "0",
  reorderLevel: "10",
  warehouse: "",
  supplier: "",
});

  const [adjustmentQuantity, setAdjustmentQuantity] =
    useState("");

  const [adjustmentReason, setAdjustmentReason] =
    useState("");

  const [adjusting, setAdjusting] = useState(false);

  const [adjustmentError, setAdjustmentError] =
    useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/products`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch products"
        );
      }

      const result = await response.json();

      setProducts(result.data ?? []);
    } catch (err) {
      console.error(
        "Failed to fetch products:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuppliers() {
  try {
    const response = await fetch(
      `${API_URL}/api/suppliers`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch suppliers");
    }

    const result = await response.json();

    if (result.success) {
      setSuppliers(
        result.data.filter(
          (supplier: Supplier) =>
            supplier.status === "Active"
        )
      );
    }
  } catch (error) {
    console.error(
      "Failed to fetch suppliers:",
      error
    );
  }
}

  async function fetchMovements() {
    try {
      setMovementLoading(true);
      setMovementError("");

      const response = await fetch(
        `${API_URL}/api/stock-movements`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch stock movements"
        );
      }

      const result = await response.json();

      setMovements(result.data ?? []);
    } catch (err) {
      console.error(
        "Failed to fetch stock movements:",
        err
      );

      setMovementError(
        err instanceof Error
          ? err.message
          : "Failed to fetch stock movements"
      );
    } finally {
      setMovementLoading(false);
    }
  }

  async function refreshInventory() {
    await Promise.all([
      fetchProducts(),
      fetchMovements(),
    ]);
  }

  useEffect(() => {
    refreshInventory();
    fetchSuppliers();
  }, []);

  async function handleAdjustment() {
    if (!adjustingProduct) {
      return;
    }

    const quantity = Number(
      adjustmentQuantity
    );

    if (
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      setAdjustmentError(
        "Enter a non-zero whole number."
      );
      return;
    }

    if (!adjustmentReason.trim()) {
      setAdjustmentError(
        "Enter a reason for the adjustment."
      );
      return;
    }

    const newStock =
      adjustingProduct.stockQuantity + quantity;

    if (newStock < 0) {
      setAdjustmentError(
        `Stock cannot go below zero. Current stock: ${adjustingProduct.stockQuantity}`
      );
      return;
    }

    try {
      setAdjusting(true);
      setAdjustmentError("");

      const response = await fetch(
        `${API_URL}/api/inventory-adjustments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: adjustingProduct._id,
            quantity,
            reason: adjustmentReason.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to adjust inventory"
        );
      }

      await refreshInventory();

      setAdjustingProduct(null);
      setAdjustmentQuantity("");
      setAdjustmentReason("");
      setAdjustmentError("");
    } catch (err) {
      console.error(
        "Inventory adjustment error:",
        err
      );

      setAdjustmentError(
        err instanceof Error
          ? err.message
          : "Failed to adjust inventory"
      );
    } finally {
      setAdjusting(false);
    }
  }

  async function handleAddProduct() {
  try {
    setAddingProduct(true);
    setProductError("");

    if (
      !productForm.sku.trim() ||
      !productForm.name.trim() ||
      !productForm.category.trim() ||
      !productForm.brand.trim() ||
      !productForm.warehouse.trim()
    ) {
      setProductError(
        "Please fill in all required fields."
      );
      return;
    }

    const price = Number(productForm.price);
    const costPrice = Number(
      productForm.costPrice
    );
    const stockQuantity = Number(
      productForm.stockQuantity
    );
    const reorderLevel = Number(
      productForm.reorderLevel
    );

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(costPrice) ||
      costPrice < 0
    ) {
      setProductError(
        "Enter valid price and cost price."
      );
      return;
    }

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setProductError(
        "Stock quantity must be a whole number."
      );
      return;
    }

    if (
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      setProductError(
        "Reorder level must be a whole number."
      );
      return;
    }

    const response = await fetch(
      `${API_URL}/api/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: productForm.sku.trim(),
          name: productForm.name.trim(),
          category: productForm.category.trim(),
          brand: productForm.brand.trim(),
          description:
            productForm.description.trim(),
          price,
          costPrice,
          stockQuantity,
          reorderLevel,
          warehouse:
            productForm.warehouse.trim(),
          supplier:
            productForm.supplier.trim(),
          isActive: true,
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

    await refreshInventory();

    setProductForm({
      sku: "",
      name: "",
      category: "",
      brand: "",
      description: "",
      price: "",
      costPrice: "",
      stockQuantity: "0",
      reorderLevel: "10",
      warehouse: "",
      supplier: "",
    });

    setShowAddProduct(false);
  } catch (err) {
    console.error(
      "Failed to create product:",
      err
    );

    setProductError(
      err instanceof Error
        ? err.message
        : "Failed to create product"
    );
  } finally {
    setAddingProduct(false);
  }
}

  function closeAdjustmentModal() {
    if (adjusting) {
      return;
    }

    setAdjustingProduct(null);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setAdjustmentError("");
  }

  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (total, product) =>
      total + product.stockQuantity,
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.stockQuantity <=
      product.reorderLevel
  );

  const outOfStockProducts = products.filter(
    (product) =>
      product.stockQuantity === 0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      product.stockQuantity *
        product.costPrice,
    0
  );

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <ModulePage
  title="Inventory"
  description="Monitor stock levels, warehouses, and inventory movements."
  icon={Boxes}
  actionLabel="Add Product"
  onAction={() => {
    setProductError("");
    setShowAddProduct(true);
  }}
>
      {/* Refresh */}
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={refreshInventory}
          disabled={
            loading || movementLoading
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading || movementLoading
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
              <PackageSearch size={20} />
            </div>

            <span className="text-xs text-slate-600">
              Products
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {totalProducts}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Active inventory items
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/60 text-blue-400">
              <Boxes size={20} />
            </div>

            <span className="text-xs text-slate-600">
              Units
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {totalStockUnits}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total units in stock
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 text-amber-400">
              <AlertTriangle size={20} />
            </div>

            <span className="text-xs text-slate-600">
              Attention
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {lowStockProducts.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Low stock products
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>

            <span className="text-xs text-slate-600">
              Value
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-white">
            {formatCurrency(inventoryValue)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Inventory cost value
          </p>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Products */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Inventory Stock
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current stock levels across products.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            {outOfStockProducts.length} out of stock
          </div>
        </div>

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
                  Warehouse
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Stock
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Reorder Level
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <PackageSearch
                      size={32}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      No products found.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isOutOfStock =
                    product.stockQuantity === 0;

                  const isLowStock =
                    product.stockQuantity <=
                    product.reorderLevel;

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {product.name}
                        </div>

                        <div className="mt-1 font-mono text-xs text-slate-600">
                          {product.sku}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {product.brand}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {product.warehouse}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-red-400"
                              : isLowStock
                                ? "text-amber-400"
                                : "text-white"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {product.reorderLevel}
                      </td>

                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="rounded-full bg-red-950 px-2.5 py-1 text-xs font-medium text-red-400">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="rounded-full bg-amber-950 px-2.5 py-1 text-xs font-medium text-amber-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingProduct(
                              product
                            );
                            setAdjustmentQuantity(
                              ""
                            );
                            setAdjustmentReason(
                              ""
                            );
                            setAdjustmentError(
                              ""
                            );
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-500 hover:bg-violet-950/40 hover:text-violet-300"
                        >
                          <SlidersHorizontal
                            size={14}
                          />
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Stock Movement History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Track inventory received, sold, and manually
            adjusted.
          </p>
        </div>

        {movementError && (
          <div className="m-4 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {movementError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">
                  Type
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Product
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Quantity
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Stock Change
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Reason
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Reference
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {movementLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading stock movements...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center"
                  >
                    <Boxes
                      size={32}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      No stock movements yet.
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr
                    key={movement._id}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                  >
                    <td className="px-6 py-4">
                      {movement.type === "IN" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          <ArrowDownToLine
                            size={13}
                          />
                          IN
                        </span>
                      ) : movement.type === "OUT" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950 px-2.5 py-1 text-xs font-medium text-blue-400">
                          <ArrowUpFromLine
                            size={13}
                          />
                          OUT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-950 px-2.5 py-1 text-xs font-medium text-violet-400">
                          <SlidersHorizontal
                            size={13}
                          />
                          ADJUSTMENT
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {movement.productName}
                      </div>

                      <div className="mt-1 font-mono text-xs text-slate-600">
                        {movement.sku}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {movement.type === "OUT"
                        ? `-${movement.quantity}`
                        : movement.type ===
                            "IN"
                          ? `+${movement.quantity}`
                          : movement.quantity}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {movement.previousStock}
                      <span className="mx-2 text-slate-700">
                        →
                      </span>
                      {movement.newStock}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {movement.reason}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {movement.reference || "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                      {formatDate(
                        movement.createdAt
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeAdjustmentModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Adjust Stock
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manually correct inventory quantity.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAdjustmentModal}
                disabled={adjusting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs text-slate-500">
                  Product
                </p>

                <p className="mt-1 font-medium text-white">
                  {adjustingProduct.name}
                </p>

                <p className="mt-1 font-mono text-xs text-slate-600">
                  {adjustingProduct.sku}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs text-slate-500">
                  Current Stock
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {
                    adjustingProduct.stockQuantity
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="adjustment-quantity"
                  className="text-sm font-medium text-slate-300"
                >
                  Adjustment Quantity
                </label>

                <p className="mt-1 text-xs text-slate-600">
                  Positive number adds stock.
                  Negative number removes stock.
                </p>

                <input
                  id="adjustment-quantity"
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(event) =>
                    setAdjustmentQuantity(
                      event.target.value
                    )
                  }
                  placeholder="Example: 5 or -3"
                  disabled={adjusting}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="adjustment-reason"
                  className="text-sm font-medium text-slate-300"
                >
                  Reason
                </label>

                <input
                  id="adjustment-reason"
                  type="text"
                  value={adjustmentReason}
                  onChange={(event) =>
                    setAdjustmentReason(
                      event.target.value
                    )
                  }
                  placeholder="Physical stock correction"
                  disabled={adjusting}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                />
              </div>

              {adjustmentQuantity &&
                Number.isInteger(
                  Number(adjustmentQuantity)
                ) &&
                Number(adjustmentQuantity) !==
                  0 && (
                  <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 p-4">
                    <p className="text-xs text-slate-500">
                      New Stock
                    </p>

                    <p className="mt-1 text-xl font-bold text-violet-300">
                      {adjustingProduct.stockQuantity +
                        Number(
                          adjustmentQuantity
                        )}
                    </p>
                  </div>
                )}

              {adjustmentError && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  {adjustmentError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
              <button
                type="button"
                disabled={adjusting}
                onClick={closeAdjustmentModal}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={adjusting}
                onClick={handleAdjustment}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adjusting
                  ? "Adjusting..."
                  : "Adjust Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
            {/* Add Product Modal */}
      {showAddProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddProduct(false);
              setProductError("");
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Add Product
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add a new product to your inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddProduct(false);
                  setProductError("");
                }}
                disabled={addingProduct}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* SKU */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    SKU *
                  </label>

                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        sku: event.target.value,
                      })
                    }
                    placeholder="PRD-1001"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Dell Latitude 5450"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Category *
                  </label>

                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        category: event.target.value,
                      })
                    }
                    placeholder="Laptops"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Brand *
                  </label>

                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        brand: event.target.value,
                      })
                    }
                    placeholder="Dell"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Selling Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: event.target.value,
                      })
                    }
                    placeholder="48000"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Cost Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.costPrice}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        costPrice:
                          event.target.value,
                      })
                    }
                    placeholder="42000"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Opening Stock */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Opening Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stockQuantity:
                          event.target.value,
                      })
                    }
                    placeholder="0"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Reorder Level */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Reorder Level
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.reorderLevel}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        reorderLevel:
                          event.target.value,
                      })
                    }
                    placeholder="10"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Warehouse */}
                <div>
                  <label className="text-sm font-medium text-slate-300">
                    Warehouse *
                  </label>

                  <input
                    type="text"
                    value={productForm.warehouse}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        warehouse:
                          event.target.value,
                      })
                    }
                    placeholder="Chennai Warehouse"
                    disabled={addingProduct}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>

                {/* Supplier */}
                <div>

                  <div>
  <label className="text-sm font-medium text-slate-300">
    Supplier
  </label>

  <select
    value={productForm.supplier}
    onChange={(event) =>
      setProductForm({
        ...productForm,
        supplier: event.target.value,
      })
    }
    disabled={addingProduct}
    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 disabled:opacity-50"
  >
    <option value="">
      Select supplier
    </option>

    {suppliers.map((supplier) => (
      <option
        key={supplier._id}
        value={supplier._id}
      >
        {supplier.companyName} (
        {supplier.supplierId})
      </option>
    ))}
  </select>
</div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300">
                    Description
                  </label>

                  <textarea
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Product description..."
                    rows={3}
                    disabled={addingProduct}
                    className="mt-2 w-full resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Error */}
              {productError && (
                <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  {productError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
              <button
                type="button"
                disabled={addingProduct}
                onClick={() => {
                  setShowAddProduct(false);
                  setProductError("");
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={addingProduct}
                onClick={handleAddProduct}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingProduct
                  ? "Adding Product..."
                  : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModulePage>
  );
}