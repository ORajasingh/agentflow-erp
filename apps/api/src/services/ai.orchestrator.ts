import { getInventoryInsights } from "../agents/inventory.agent.js";
import { getSalesInsights } from "../agents/sales.agent.js";
import { getFinanceInsights } from "../agents/finance.agent.js";
import {
  getProcurementInsights,
} from "../agents/procurement.agent.js";

// ============================================================
// TYPES
// ============================================================

export type AgentName =
  | "inventory"
  | "sales"
  | "finance"
  | "procurement"
  | "general";

export type ActionName =
  | "create_purchase_order"
  | "none";

export interface DetectedAction {
  name: ActionName;
  confidence: "high" | "medium" | "low";
}

export interface OrchestratorResult {
  agent: AgentName;
  data: unknown;
  action: DetectedAction;
}

// ============================================================
// AGENT DETECTION
// ============================================================

export function detectAgent(
  message: string
): AgentName {
  const text = message
    .toLowerCase()
    .trim();

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
    text.includes("supplier") ||
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

  return "general";
}

// ============================================================
// ACTION DETECTION
// ============================================================

export function detectAction(
  message: string
): DetectedAction {
  const text = message
    .toLowerCase()
    .trim();

  // ----------------------------------------
  // CREATE PURCHASE ORDER
  // ----------------------------------------

  const purchaseOrderAction =
    text.includes("create purchase order") ||
    text.includes("create a purchase order") ||
    text.includes("create po") ||
    text.includes("create a po") ||
    text.includes("make purchase order") ||
    text.includes("make a purchase order") ||
    text.includes("make po") ||
    text.includes("make a po") ||
    text.includes("raise purchase order") ||
    text.includes("raise a purchase order") ||
    text.includes("raise po") ||
    text.includes("raise a po") ||
    text.includes("generate purchase order") ||
    text.includes("generate a purchase order") ||
    text.includes("generate po") ||
    text.includes("generate a po") ||
    text.includes("place purchase order") ||
    text.includes("place a purchase order") ||
    text.includes("place po") ||
    text.includes("place a po");

  if (purchaseOrderAction) {
    return {
      name: "create_purchase_order",
      confidence: "high",
    };
  }

  // ----------------------------------------
  // BUY / ORDER PRODUCT
  // ----------------------------------------

  const buyingAction =
    text.startsWith("buy ") ||
    text.startsWith("buying ") ||
    text.startsWith("order ") ||
    text.startsWith("purchase ");

  if (buyingAction) {
    return {
      name: "create_purchase_order",
      confidence: "medium",
    };
  }

  // ----------------------------------------
  // NO ACTION
  // ----------------------------------------

  return {
    name: "none",
    confidence: "high",
  };
}

// ============================================================
// RUN READ-ONLY AGENT
// ============================================================

export async function runAgent(
  agent: AgentName
): Promise<unknown> {
  switch (agent) {
    case "inventory":
      return await getInventoryInsights();

    case "sales":
      return await getSalesInsights();

    case "finance":
      return await getFinanceInsights();

    case "procurement":
      return await getProcurementInsights();

    case "general":
    default:
      return null;
  }
}

// ============================================================
// ORCHESTRATOR
// ============================================================

export async function orchestrate(
  message: string
): Promise<OrchestratorResult> {
  const cleanMessage =
    message.trim();

  if (!cleanMessage) {
    throw new Error(
      "Message cannot be empty"
    );
  }

  // ----------------------------------------
  // Detect agent
  // ----------------------------------------

  const agent =
    detectAgent(cleanMessage);

  // ----------------------------------------
  // Detect requested action
  // ----------------------------------------

  const action =
    detectAction(cleanMessage);

  console.log(
    `🧠 Orchestrator: "${cleanMessage}" → agent=${agent}, action=${action.name}`
  );

  // ----------------------------------------
  // Run the selected READ-ONLY agent
  //
  // IMPORTANT:
  // Action detection does NOT execute the
  // write operation.
  //
  // create_purchase_order is handled later
  // by the confirmation/action layer.
  // ----------------------------------------

  const data =
    await runAgent(agent);

  // ----------------------------------------
  // Return orchestration result
  // ----------------------------------------

  return {
    agent,
    data,
    action,
  };
}