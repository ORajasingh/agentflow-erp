import { getInventoryInsights } from "../agents/inventory.agent.js";
import { getSalesInsights } from "../agents/sales.agent.js";
import { getFinanceInsights } from "../agents/finance.agent.js";
import { getProcurementInsights } from "../agents/procurement.agent.js";
import { resolvePurchaseOrder } from "../actions/procurement.resolver.js";
import PendingProcurement from "../models/PendingProcurement.js";

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

export interface ProcurementActionResult {
  status: "needs_details" | "resolved" | "blocked";
  message: string;
  details?: Awaited<ReturnType<typeof resolvePurchaseOrder>>;
  pendingProcurementId?: string;
}

export interface OrchestratorResult {
  agent: AgentName;
  data: unknown;
  action: DetectedAction;
  actionResult?: ProcurementActionResult;
}

// ============================================================
// AGENT DETECTION
// ============================================================

export function detectAgent(message: string): AgentName {
  const text = message.toLowerCase().trim();

  if (
    /\b(inventory|stock|stocks|low stock|low-stock|running low|runs low|out of stock|reorder|warehouse|available quantity|stock quantity|product quantity)\b/.test(text) ||
    text.includes("which products are low") ||
    text.includes("which products need")
  ) {
    return "inventory";
  }

  if (
    /\b(sales|sale|sold|selling|revenue|best selling|best-selling|top selling|top-selling)\b/.test(text) ||
    text.includes("sales order") ||
    text.includes("customer sales")
  ) {
    return "sales";
  }

  if (
    /\b(finance|financial|income|expense|expenses|profit|payment|payments|budget|money|spending|spent|cost|cash flow|cashflow)\b/.test(text)
  ) {
    return "finance";
  }

  if (
    /\b(procurement|purchase|purchases|supplier|suppliers|vendor|vendors|buy|buying|ordered|ordering)\b/.test(text) ||
    text.includes("purchase order") ||
    text.includes("received goods")
  ) {
    return "procurement";
  }

  return "general";
}

// ============================================================
// ACTION DETECTION
// ============================================================

export function detectAction(message: string): DetectedAction {
  const text = message.toLowerCase().trim();

  if (
    /^(how|what|why|when|where|explain|tell me about)\b/.test(text) &&
    !/\b(buy|order|purchase|procure)\s+\d+\b/.test(text)
  ) {
    return { name: "none", confidence: "high" };
  }

  const explicitAction =
    /\b(create|make|raise|generate|place)\s+(?:a\s+)?(?:purchase order|po)\b/.test(text);

  const buyingAction =
    /\b(?:buy|order|purchase|procure)\s+\d+\b/.test(text) ||
    /^(?:buy|order|purchase|procure)\b/.test(text);

  if (explicitAction || buyingAction) {
    return {
      name: "create_purchase_order",
      confidence: explicitAction ? "high" : "medium",
    };
  }

  return { name: "none", confidence: "high" };
}

// ============================================================
// PURCHASE REQUEST PARSER
// ============================================================

interface ParsedPurchaseRequest {
  productName?: string;
  quantity?: number;
}

function cleanProductName(value: string): string {
  return value
    .replace(/^[\s"'`]+|[\s"'`]+$/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(
      /\s+(?:laptops?|notebooks?|computers?|pcs?|pieces?|units?|products?|items?)$/i,
      ""
    )
    .trim();
}

export function parsePurchaseRequest(
  message: string
): ParsedPurchaseRequest {
  const text = message.trim();

  const quantityFirst =
    text.match(
      /\b(?:buy|order|purchase|procure)\s+(?:me\s+)?(\d+)\s+(?:of\s+)?(.+?)(?:[.!?]+)?$/i
    ) ??
    text.match(
      /\b(?:create|make|raise|generate|place)\s+(?:a\s+)?(?:purchase order|po)\s+for\s+(\d+)\s+(?:of\s+)?(.+?)(?:[.!?]+)?$/i
    );

  if (quantityFirst) {
    return {
      quantity: Number(quantityFirst[1]),
      productName: cleanProductName(quantityFirst[2]),
    };
  }

  const quantityLast = text.match(
    /\b(?:buy|order|purchase|procure)\s+(.+?)\s+(?:quantity|qty)\s*[:=]?\s*(\d+)\s*$/i
  );

  if (quantityLast) {
    return {
      productName: cleanProductName(quantityLast[1]),
      quantity: Number(quantityLast[2]),
    };
  }

  return {};
}

// ============================================================
// READ-ONLY AGENTS
// ============================================================

export async function runAgent(
  agent: AgentName
): Promise<unknown> {
  switch (agent) {
    case "inventory":
      return getInventoryInsights();

    case "sales":
      return getSalesInsights();

    case "finance":
      return getFinanceInsights();

    case "procurement":
      return getProcurementInsights();

    case "general":
    default:
      return null;
  }
}

// ============================================================
// PENDING PROCUREMENT PERSISTENCE
// ============================================================

type ResolvedPurchase = Awaited<
  ReturnType<typeof resolvePurchaseOrder>
>;

async function savePendingProcurement(
  sessionId: string,
  resolution: ResolvedPurchase
): Promise<string> {
  if (
    !resolution.resolved ||
    !resolution.product ||
    !resolution.supplier
  ) {
    throw new Error(
      "Cannot save a procurement request without a resolved product and active supplier."
    );
  }

  const productId = resolution.product.id;
  const supplierId = resolution.supplier.id;
  const quantity = resolution.product.quantity;
  const unitCost = resolution.product.price;
  const totalAmount = resolution.totalAmount;

  if (
    !productId ||
    !supplierId ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(unitCost) ||
    unitCost <= 0 ||
    !Number.isFinite(totalAmount) ||
    totalAmount === undefined || totalAmount <= 0
  ) {
    throw new Error(
      "The resolved procurement details are incomplete or invalid."
    );
  }

  const pending = await PendingProcurement.create({
    sessionId,
    productId,
    productName: resolution.product.name,
    sku: resolution.product.sku,
    quantity,
    unitCost,
    supplierId,
    supplierName: resolution.supplier.name,
    status: "awaiting_confirmation",
    totalAmount,
    requiresApproval: resolution.requiresApproval,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  return pending.id;
}

// ============================================================
// ORCHESTRATOR
// ============================================================

export async function orchestrate(
  message: string,
  sessionId?: string
): Promise<OrchestratorResult> {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error("Message cannot be empty");
  }

  const agent = detectAgent(cleanMessage);
  const action = detectAction(cleanMessage);

  console.log(
    `Orchestrator: agent=${agent}, action=${action.name}`
  );

  const data = await runAgent(agent);

  let actionResult: ProcurementActionResult | undefined;

  if (action.name === "create_purchase_order") {
    const parsed = parsePurchaseRequest(cleanMessage);

    if (!parsed.productName || !parsed.quantity) {
      actionResult = {
        status: "needs_details",
        message:
          "Please specify the product name and a positive whole-number quantity. " +
          'For example: "Buy 2 Dell Latitude 5450 laptops".',
      };
    } else if (
      !Number.isSafeInteger(parsed.quantity) ||
      parsed.quantity <= 0
    ) {
      actionResult = {
        status: "needs_details",
        message: "Quantity must be a positive whole number.",
      };
    } else {
      try {
        const resolution = await resolvePurchaseOrder(
          parsed.productName,
          parsed.quantity
        );

        if (!resolution.resolved) {
          actionResult = {
            status: "blocked",
            message: resolution.message,
            details: resolution,
          };
        } else if (sessionId?.trim()) {
          const pendingProcurementId =
            await savePendingProcurement(
              sessionId.trim(),
              resolution
            );

          actionResult = {
            status: "resolved",
            message:
              `${resolution.message} ` +
              "The request has been saved for confirmation. " +
              "No purchase order has been created yet.",
            details: resolution,
            pendingProcurementId,
          };
        } else {
          actionResult = {
            status: "resolved",
            message:
              `${resolution.message} ` +
              "A conversation ID is required to save this request for confirmation. " +
              "No purchase order has been created.",
            details: resolution,
          };
        }
      } catch (error) {
        console.error("Purchase resolution failed:", error);

        actionResult = {
          status: "blocked",
          message:
            "I couldn't prepare this purchase request because an internal error occurred. No purchase order was created.",
        };
      }
    }
  }

  return {
    agent,
    data,
    action,
    ...(actionResult ? { actionResult } : {}),
  };
}