import { getInventoryInsights } from "../agents/inventory.agent.js";
import { getSalesInsights } from "../agents/sales.agent.js";
import { getFinanceInsights } from "../agents/finance.agent.js";

import {
  getProcurementInsights,
  getLowStockProducts,
  getActiveSuppliers,
  preparePurchaseOrderDraft,
} from "../agents/procurement.agent.js";

export type AgentName =
  | "inventory"
  | "sales"
  | "finance"
  | "procurement"
  | "general";

export interface OrchestratorResult {
  agent: AgentName;
  data: unknown;
}

/**
 * Detect which ERP agent should handle the request.
 */
export function detectAgent(
  message: string
): AgentName {
  const text = message
    .toLowerCase()
    .trim();

  // ----------------------------------------
  // PROCUREMENT ACTIONS
  // ----------------------------------------
  // These must be checked BEFORE inventory
  // because purchase-order requests may also
  // contain words like "stock" or "product".
  // ----------------------------------------

  if (
    text.includes("create purchase order") ||
    text.includes("create a purchase order") ||
    text.includes("make purchase order") ||
    text.includes("make a purchase order") ||
    text.includes("generate purchase order") ||
    text.includes("generate a purchase order") ||
    text.includes("prepare purchase order") ||
    text.includes("prepare a purchase order") ||
    text.includes("create po") ||
    text.includes("create a po") ||
    text.includes("generate po") ||
    text.includes("generate a po") ||
    text.includes("prepare po") ||
    text.includes("prepare a po")
  ) {
    return "procurement";
  }

  // ----------------------------------------
  // PROCUREMENT
  // ----------------------------------------

  if (
    text.includes("procurement") ||
    text.includes("purchase") ||
    text.includes("purchases") ||
    text.includes("purchase order") ||
    text.includes("purchase orders") ||
    text.includes("supplier") ||
    text.includes("suppliers") ||
    text.includes("vendor") ||
    text.includes("vendors") ||
    text.includes("buy") ||
    text.includes("buying") ||
    text.includes("ordered") ||
    text.includes("ordering") ||
    text.includes("received goods")
  ) {
    return "procurement";
  }

  // ----------------------------------------
  // INVENTORY
  // ----------------------------------------

  if (
    text.includes("inventory") ||
    text.includes("stock") ||
    text.includes("stocks") ||
    text.includes("low stock") ||
    text.includes("low-stock") ||
    text.includes("running low") ||
    text.includes("runs low") ||
    text.includes("out of stock") ||
    text.includes("reorder") ||
    text.includes("reorder level") ||
    text.includes("warehouse") ||
    text.includes("available quantity") ||
    text.includes("stock quantity") ||
    text.includes("product quantity") ||
    text.includes("how many products") ||
    text.includes("which products are low") ||
    text.includes("which products need")
  ) {
    return "inventory";
  }

  // ----------------------------------------
  // SALES
  // ----------------------------------------

  if (
    text.includes("sales") ||
    text.includes("sale") ||
    text.includes("sold") ||
    text.includes("selling") ||
    text.includes("revenue") ||
    text.includes("sales order") ||
    text.includes("sales orders") ||
    text.includes("best selling") ||
    text.includes("best-selling") ||
    text.includes("top selling") ||
    text.includes("top-selling") ||
    text.includes("customer sales")
  ) {
    return "sales";
  }

  // ----------------------------------------
  // FINANCE
  // ----------------------------------------

  if (
    text.includes("finance") ||
    text.includes("financial") ||
    text.includes("income") ||
    text.includes("expense") ||
    text.includes("expenses") ||
    text.includes("profit") ||
    text.includes("cash flow") ||
    text.includes("cashflow") ||
    text.includes("payment") ||
    text.includes("payments") ||
    text.includes("budget") ||
    text.includes("money") ||
    text.includes("spending") ||
    text.includes("spent") ||
    text.includes("cost")
  ) {
    return "finance";
  }

  return "general";
}

/**
 * Run the appropriate ERP agent.
 */
export async function runAgent(
  agent: AgentName,
  message = ""
): Promise<unknown> {
  const text = message
    .toLowerCase()
    .trim();

  switch (agent) {
    // ----------------------------------------
    // INVENTORY
    // ----------------------------------------

    case "inventory":
      return await getInventoryInsights();

    // ----------------------------------------
    // SALES
    // ----------------------------------------

    case "sales":
      return await getSalesInsights();

    // ----------------------------------------
    // FINANCE
    // ----------------------------------------

    case "finance":
      return await getFinanceInsights();

    // ----------------------------------------
    // PROCUREMENT
    // ----------------------------------------

    case "procurement": {
      // Purchase-order preparation request
      if (
        text.includes("prepare purchase order") ||
        text.includes("prepare a purchase order") ||
        text.includes("prepare po") ||
        text.includes("prepare a po") ||
        text.includes("create purchase order") ||
        text.includes("create a purchase order") ||
        text.includes("create po") ||
        text.includes("create a po") ||
        text.includes("generate purchase order") ||
        text.includes("generate a purchase order") ||
        text.includes("generate po") ||
        text.includes("generate a po")
      ) {
        return await preparePurchaseOrderDraft();
      }

      // Supplier-related requests
      if (
        text.includes("supplier") ||
        text.includes("suppliers") ||
        text.includes("vendor") ||
        text.includes("vendors")
      ) {
        return await getActiveSuppliers();
      }

      // Low-stock procurement analysis
      if (
        text.includes("low stock") ||
        text.includes("low-stock") ||
        text.includes("running low") ||
        text.includes("reorder")
      ) {
        return await getLowStockProducts();
      }

      // General procurement questions
      return await getProcurementInsights();
    }

    // ----------------------------------------
    // GENERAL
    // ----------------------------------------

    case "general":
    default:
      return null;
  }
}

/**
 * Main orchestrator.
 */
export async function orchestrate(
  message: string
): Promise<OrchestratorResult> {
  const agent = detectAgent(message);

  console.log(
    `🧠 Orchestrator: "${message}" → ${agent}`
  );

  const data = await runAgent(
    agent,
    message
  );

  return {
    agent,
    data,
  };
}