"use client";

import {

  ArrowRight,

  Bot,

  BrainCircuit,

  CheckCircle2,

  Clock3,

  Database,

  FileSearch,

  Loader2,

  MessageSquare,

  Send,

  Sparkles,

  User,

  X,

  Wallet,

  ShoppingCart,

  Package,

  AlertTriangle,

  Check,

} from "lucide-react";

import { useEffect, useState } from "react";

const API_URL =

  process.env.NEXT_PUBLIC_API_URL ||

  "http://localhost:4000";

const suggestions = [

  "Which products are running low?",

  "Can we afford the current purchase orders?",

  "Why did sales change this month?",

  "Find the best supplier for Dell laptops.",

];

type AgentName =

  | "inventory"

  | "sales"

  | "finance"

  | "procurement"

  | "general";

type Message = {

  role: "user" | "assistant";

  content: string;

};

type LowStockProduct = {

  productId: string;

  sku: string;

  name: string;

  category: string;

  brand: string;

  currentStock: number;

  reorderLevel: number;

  suggestedQuantity: number;

  unitPrice: number;

  costPrice: number;

  warehouse: string;

  supplier?: string;

};

type Supplier = {

  id: string;

  supplierId: string;

  companyName: string;

  contactPerson?: string;

  category?: string;

  rating?: number;

  totalOrders?: number;

  totalPurchaseValue?: number;

  status: string;

};

type PurchaseOrderDraft = {

  success: boolean;

  hasLowStock: boolean;

  message?: string;

  products: LowStockProduct[];

  suppliers: Supplier[];

};

type PendingAction = {

  type: "CREATE_PURCHASE_ORDER";

  draft: PurchaseOrderDraft;

};

type ChatProcurement = {

  pendingProcurementId: string;

  productName: string;

  sku: string;

  quantity: number;

  supplierName: string;

  unitCost: number;

  totalAmount: number;

  requiresApproval?: boolean;

};

const agentInfo: Record<

  AgentName,

  {

    name: string;

    description: string;

    icon: typeof Database;

  }

> = {

  inventory: {

    name: "Inventory Agent",

    description: "Analyzing stock levels...",

    icon: Database,

  },

  sales: {

    name: "Sales Agent",

    description: "Analyzing sales performance...",

    icon: ShoppingCart,

  },

  finance: {

    name: "Finance Agent",

    description: "Analyzing financial data...",

    icon: Wallet,

  },

  procurement: {

    name: "Procurement Agent",

    description: "Analyzing suppliers and purchases...",

    icon: FileSearch,

  },

  general: {

    name: "General Assistant",

    description: "Processing your request...",

    icon: BrainCircuit,

  },

};

const allAgents: AgentName[] = [

  "inventory",

  "sales",

  "finance",

  "procurement",

];

export default function AICommandCenterPage() {

    const [sessionId, setSessionId] = useState("");

  useEffect(() => {

    const storageKey = "agentflow_ai_session_id";

    const storedSessionId = window.localStorage.getItem(storageKey);

    if (

      storedSessionId &&

      /^[a-zA-Z0-9_-]{8,100}$/.test(storedSessionId)

    ) {

      setSessionId(storedSessionId);

      return;

    }

    const newSessionId = crypto.randomUUID();

    window.localStorage.setItem(storageKey, newSessionId);

    setSessionId(newSessionId);

  }, []);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function loadConversation() {
      setHistoryLoaded(false);
      try {
        const response = await fetch(
          `${API_URL}/api/ai/chat?sessionId=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );
        const result = await response.json();
        console.log("AI PROCUREMENT DEBUG:", result);
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load conversation history.");
        }
        if (!cancelled) {
          setMessages(
            Array.isArray(result.data?.messages)
              ? result.data.messages.map((item: { role: string; content: string }) => ({
                  role: item.role === "assistant" ? "assistant" as const : "user" as const,
                  content: item.content,
                }))
              : []
          );
        }
      } catch (error) {
        console.error("Conversation history loading failed:", error);
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    }

    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>(

    []

  );

  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [loading, setLoading] = useState(false);

  const [activeAgent, setActiveAgent] =

    useState<AgentName>("general");

  const [lastAgent, setLastAgent] =

    useState<AgentName | null>(null);

  const [pendingAction, setPendingAction] =

    useState<PendingAction | null>(null);

  const [actionLoading, setActionLoading] =

    useState(false);

    const [chatProcurement, setChatProcurement] =

  useState<ChatProcurement | null>(null);

const [chatProcurementLoading, setChatProcurementLoading] =

  useState(false);

  const sendMessage = async (text?: string) => {

    const value = (text ?? message).trim();

   if (!value || loading || actionLoading || !sessionId || !historyLoaded) {

  return;

}

    const previousHistory = [...messages];

    setMessages((previous) => [

      ...previous,

      {

        role: "user",

        content: value,

      },

    ]);

    setMessage("");

    setLoading(true);

    setActiveAgent("general");

    try {

      const response = await fetch(

        `${API_URL}/api/ai/chat`,

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            message: value,

            sessionId,

            history: previousHistory

              .filter(

                (item) =>

                  item.role === "user" ||

                  item.role === "assistant"

              )

              .slice(-10)

              .map((item) => ({

                role:

                  item.role === "assistant"

                    ? "model"

                    : "user",

                content: item.content,

              })),

          }),

        }

      );

      const result = await response.json();

      console.log(
  "ACTUAL AI CHAT RESPONSE:",
  JSON.stringify(result, null, 2)
);

console.log("PROCUREMENT ACTION:", result.data?.action);

console.log(
  "PROCUREMENT ACTION RESULT:",
  result.data?.actionResult
);

      if (!response.ok || !result.success) {

        throw new Error(

          result.message ||

            "AI request failed"

        );

      }

      const selectedAgent: AgentName =

        result.data?.agent || "general";

      setActiveAgent(selectedAgent);

      setLastAgent(selectedAgent);

      setMessages((previous) => [

        ...previous,

        {

          role: "assistant",

          content: result.data.message,

        },

      ]);

      /*

       * Detect a purchase-order draft returned

       * by the Procurement Agent.

       */

      
const agentData = result.data?.agentData;
const actionResult = result.data?.actionResult;


if (actionResult?.pendingProcurementId) {
  const resolution = actionResult.details;

  const product = resolution?.product;
  const supplier = resolution?.supplier;
  const quantity = Number(product?.quantity);
  const unitCost = Number(product?.price);
  const totalAmount = Number(resolution?.totalAmount);

  if (
    typeof product?.name === "string" &&
    typeof product?.sku === "string" &&
    typeof supplier?.name === "string" &&
    Number.isSafeInteger(quantity) &&
    quantity > 0 &&
    Number.isFinite(unitCost) &&
    unitCost > 0 &&
    Number.isFinite(totalAmount) &&
    totalAmount > 0
  ) {
    setChatProcurement({
      pendingProcurementId: actionResult.pendingProcurementId,
      productName: product.name,
      sku: product.sku,
      quantity,
      supplierName: supplier.name,
      unitCost,
      totalAmount,
      requiresApproval: Boolean(resolution?.requiresApproval),
    });
  } else {
    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content:
          "The procurement request was saved, but its confirmation details are incomplete. No purchase order has been created.",
      },
    ]);
  }
}



      if (

        selectedAgent === "procurement" &&

        agentData?.hasLowStock === true &&

        Array.isArray(agentData?.products) &&

        agentData.products.length > 0

      ) {

        const lowerMessage =

          value.toLowerCase();

        const isPurchaseAction =

          lowerMessage.includes(

            "create purchase order"

          ) ||

          lowerMessage.includes(

            "create a purchase order"

          ) ||

          lowerMessage.includes(

            "prepare purchase order"

          ) ||

          lowerMessage.includes(

            "prepare a purchase order"

          ) ||

          lowerMessage.includes("create po") ||

          lowerMessage.includes("prepare po") ||

          lowerMessage.includes(

            "generate purchase order"

          ) ||

          lowerMessage.includes("generate po");

        if (isPurchaseAction) {

          setPendingAction({

            type: "CREATE_PURCHASE_ORDER",

            draft: agentData,

          });

        }

      }

    } catch (error) {

      console.error(

        "AI chat error:",

        error

      );

      const errorMessage =

        error instanceof Error

          ? error.message

          : "Unknown error";

      setMessages((previous) => [

        ...previous,

        {

          role: "assistant",

          content:

            `AI service error: ${errorMessage}`,

        },

      ]);

    } finally {

      setLoading(false);

    }

  };

  /*

   * Confirm and create a purchase order only when the assigned supplier

   * can be matched to an active supplier record.

   */

const confirmChatProcurement = async () => {

  if (!chatProcurement || !sessionId || chatProcurementLoading) {

    return;

  }

  setChatProcurementLoading(true);

  try {

    const response = await fetch(

      `/api/ai/procurement/${chatProcurement.pendingProcurementId}/confirm`,

      {

        method: "POST",

        credentials: "same-origin",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({ sessionId }),

        cache: "no-store",

      }

    );

    const result = await response.json();
    console.log(
  "AI CHAT RESPONSE:",
  JSON.stringify(result, null, 2)
);

    if (!response.ok || !result.success) {

      throw new Error(

        result.message || "Purchase order confirmation failed."

      );

    }

    const order = result.data?.purchaseOrder;

    setMessages((previous) => [

      ...previous,

      {

        role: "assistant",

        content: [

          result.data?.alreadyConfirmed

            ? "This procurement was already confirmed."

            : "Purchase order created successfully.",

          `Purchase Order: ${order?.orderNumber ?? "Created"}`,

          `Supplier: ${order?.supplierName ?? chatProcurement.supplierName}`,

          `Total: ₹${Number(

            order?.totalAmount ?? chatProcurement.totalAmount

          ).toLocaleString("en-IN")}`,

          `Status: ${order?.status ?? "Pending"}`,

          result.data?.requiresApproval

            ? "Approval is required."

            : "The purchase order is awaiting approval.",

        ].join("\n"),

      },

    ]);

    setChatProcurement(null);

  } catch (error) {

    setMessages((previous) => [

      ...previous,

      {

        role: "assistant",

        content: `Purchase order not confirmed.\n${

          error instanceof Error

            ? error.message

            : "An unexpected error occurred."

        }`,

      },

    ]);

  } finally {

    setChatProcurementLoading(false);

  }

};

  /*

   * Cancel pending action.

   */

  /*

   * Confirm and create a purchase order for the existing low-stock workflow.

   * Keep this separate from chat-based procurement confirmation.

   */

  const confirmPurchaseOrder = async () => {

    if (!pendingAction || pendingAction.type !== "CREATE_PURCHASE_ORDER") {

      return;

    }

    const draft = pendingAction.draft;

    if (!draft.products?.length) {

      setMessages((previous) => [

        ...previous,

        {

          role: "assistant",

          content: "No products were found for this purchase order.",

        },

      ]);

      setPendingAction(null);

      return;

    }

    setActionLoading(true);

    try {

      const supplierNames = draft.products.map(

        (product) => product.supplier?.trim() ?? ""

      );

      if (supplierNames.some((name) => !name)) {

        throw new Error(

          "One or more products have no assigned supplier. Verify the product supplier information before creating this order."

        );

      }

      const uniqueSupplierNames = [

        ...new Set(supplierNames.map((name) => name.toLowerCase())),

      ];

      if (uniqueSupplierNames.length !== 1) {

        throw new Error(

          "These products have different assigned suppliers. Create separate purchase orders for each supplier."

        );

      }

      if (!draft.suppliers?.length) {

        throw new Error(

          "No active supplier records were returned. Verify the supplier data before creating this purchase order."

        );

      }

      const expectedSupplierName = supplierNames[0];

      const supplier = draft.suppliers.find(

        (item) =>

          item.status.trim().toLowerCase() === "active" &&

          item.companyName.trim().toLowerCase() ===

            expectedSupplierName.toLowerCase()

      );

      if (!supplier) {

        throw new Error(

          `The assigned supplier "${expectedSupplierName}" could not be matched to an active supplier record. No purchase order was created.`

        );

      }

      const items = draft.products.map((product) => {

        const quantity = Number(product.suggestedQuantity);

        const unitPrice = Number(product.costPrice ?? product.unitPrice);

        if (

          !product.productId ||

          !Number.isSafeInteger(quantity) ||

          quantity <= 0 ||

          !Number.isFinite(unitPrice) ||

          unitPrice <= 0

        ) {

          throw new Error(

            `Invalid product, quantity, or cost for "${product.name}".`

          );

        }

        return {

          productId: product.productId,

          quantity,

          unitPrice,

        };

      });

      const response = await fetch("/api/purchase-orders", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          supplierId: supplier.id,

          items,

          tax: 0,

        }),

      });

      const result = await response.json();

      console.log(
  "AI PROCUREMENT DEBUG:",
  JSON.stringify(result, null, 2)
);

      if (!response.ok || !result.success) {

        throw new Error(

          result.message || "Failed to create purchase order."

        );

      }

      const order = result.data;

      setMessages((previous) => [

        ...previous,

        {

          role: "assistant",

          content: `Purchase order created successfully.

Purchase Order: ${order?.orderNumber ?? "Created"}

Supplier: ${order?.supplierName ?? supplier.companyName}

Products: ${draft.products.length}

Total Amount: ₹${Number(order?.totalAmount ?? 0).toLocaleString("en-IN")}

Status: ${order?.status ?? "Pending"}`,

        },

      ]);

      setPendingAction(null);

    } catch (error) {

      console.error("Purchase order action error:", error);

      const errorMessage =

        error instanceof Error

          ? error.message

          : "Failed to create purchase order.";

      setMessages((previous) => [

        ...previous,

        {

          role: "assistant",

          content: `Purchase order not created.

${errorMessage}`,

        },

      ]);

      setPendingAction(null);

    } finally {

      setActionLoading(false);

    }

  };

  const cancelAction = () => {

    setPendingAction(null);

    setMessages((previous) => [

      ...previous,

      {

        role: "assistant",

        content:

          "Purchase order creation cancelled. No ERP data was changed.",

      },

    ]);

  };

  const getAgentStatus = (

    agent: AgentName

  ) => {

    if (

      loading &&

      activeAgent === agent

    ) {

      return "active";

    }

    if (

      !loading &&

      lastAgent === agent

    ) {

      return "completed";

    }

    return "idle";

  };

  return (

    <main className="flex-1 overflow-y-auto">

      <div className="mx-auto flex min-h-full max-w-7xl flex-col p-6 lg:p-8">

        {/* Header */}

        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-950/40">

              <Bot size={25} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h1 className="text-2xl font-bold text-white">

                  Gideon

                </h1>

                <span className="rounded-full bg-violet-950 px-2.5 py-1 text-[10px] font-medium text-violet-400">

                  AI

                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">

                ERP-powered enterprise intelligence assistant

              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5">

            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs font-medium text-emerald-400">

              System Online

            </span>

          </div>

        </div>

        {/* Main */}

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-3">

          {/* Chat */}

          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 lg:col-span-2">

            {/* Chat Header */}

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div className="flex items-center gap-3">

                <MessageSquare

                  size={18}

                  className="text-violet-400"

                />

                <div>

                  <h2 className="text-sm font-semibold text-white">

                    Business Assistant

                  </h2>

                  <p className="text-[11px] text-slate-600">

                    Ask questions about your enterprise

                  </p>

                </div>

              </div>

              <button

                type="button"

                onClick={() => {

  setMessages([]);

  setLastAgent(null);

  setPendingAction(null);

  const newSessionId = crypto.randomUUID();

  window.localStorage.setItem(

    "agentflow_ai_session_id",

    newSessionId

  );

  setSessionId(newSessionId);

}}

                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition hover:bg-slate-900 hover:text-slate-300"

              >

                <X size={13} />

                Clear

              </button>

            </div>

            {/* Messages */}

            <div className="flex-1 overflow-y-auto p-5">

              {messages.length === 0 ? (

                <div className="flex h-full min-h-[520px] flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-950 text-violet-400">

                    <Sparkles size={30} />

                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-white">

                    How can I help?

                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                    Ask Gideon about sales,

                    inventory, procurement,

                    finance, customers,

                    employees, or enterprise

                    documents.

                  </p>

                  <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-2">

                    {suggestions.map(

                      (suggestion) => (

                        <button

                          key={suggestion}

                          type="button"

                          onClick={() =>

                            sendMessage(

                              suggestion

                            )

                          }

                          disabled={

                            loading ||

                            actionLoading

                          }

                          className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-violet-800 hover:bg-violet-950/20 disabled:opacity-50"

                        >

                          <div className="flex items-center justify-between gap-3">

                            <span className="text-xs leading-5 text-slate-400 group-hover:text-slate-200">

                              {suggestion}

                            </span>

                            <ArrowRight

                              size={14}

                              className="shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-violet-400"

                            />

                          </div>

                        </button>

                      )

                    )}

                  </div>

                </div>

              ) : (

                <div className="space-y-5">

                  {messages.map(

                    (item, index) => (

                      <div

                        key={`${item.role}-${index}`}

                        className={`flex gap-3 ${

                          item.role === "user"

                            ? "justify-end"

                            : "justify-start"

                        }`}

                      >

                        {item.role ===

                          "assistant" && (

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-950 text-violet-400">

                            <Bot size={16} />

                          </div>

                        )}

                        <div

                          className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${

                            item.role === "user"

                              ? "bg-violet-600 text-white"

                              : "border border-slate-800 bg-slate-900 text-slate-300"

                          }`}

                        >

                          {item.content}

                        </div>

                        {item.role ===

                          "user" && (

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">

                            <User size={16} />

                          </div>

                        )}

                      </div>

                    )

                  )}

                  {loading && (

                    <div className="flex gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-950 text-violet-400">

                        <Bot size={16} />

                      </div>

                      <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-400">

                        <Loader2

                          size={15}

                          className="animate-spin text-violet-400"

                        />

                        Gideon is analyzing...

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

            {chatProcurement && (

  <div className="border-t border-violet-900/40 bg-violet-950/10 p-4">

    <div className="rounded-2xl border border-violet-900/50 bg-slate-950 p-5">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950 text-violet-400">

          <Package size={20} />

        </div>

        <div>

          <h3 className="text-sm font-semibold text-white">

            Confirm AI Procurement

          </h3>

          <p className="mt-1 text-xs text-slate-500">

            Review these details before creating the purchase order.

          </p>

        </div>

      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">

        <div className="flex justify-between gap-4 text-sm">

          <span className="text-slate-500">Product</span>

          <span className="text-right text-white">

            {chatProcurement.productName}

          </span>

        </div>

        <div className="flex justify-between gap-4 text-sm">

          <span className="text-slate-500">SKU</span>

          <span className="text-right text-slate-300">

            {chatProcurement.sku}

          </span>

        </div>

        <div className="flex justify-between gap-4 text-sm">

          <span className="text-slate-500">Supplier</span>

          <span className="text-right text-slate-300">

            {chatProcurement.supplierName}

          </span>

        </div>

        <div className="flex justify-between gap-4 text-sm">

          <span className="text-slate-500">Quantity</span>

          <span className="text-white">

            {chatProcurement.quantity}

          </span>

        </div>

        <div className="flex justify-between gap-4 text-sm">

          <span className="text-slate-500">Unit cost</span>

          <span className="text-white">

            ₹{chatProcurement.unitCost.toLocaleString("en-IN")}

          </span>

        </div>

        <div className="flex justify-between gap-4 border-t border-slate-800 pt-3 text-sm">

          <span className="font-medium text-slate-400">

            Total amount

          </span>

          <span className="font-semibold text-violet-400">

            ₹{chatProcurement.totalAmount.toLocaleString("en-IN")}

          </span>

        </div>

      </div>

      <p className="mt-3 text-xs text-slate-500">

        Confirmation creates a purchase order in Pending status.

        Approval remains a separate step.

      </p>

      <div className="mt-4 flex gap-3">

        <button

          type="button"

          onClick={confirmChatProcurement}

          disabled={chatProcurementLoading || actionLoading}

          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"

        >

          {chatProcurementLoading ? (

            <Loader2 size={15} className="animate-spin" />

          ) : (

            <Check size={15} />

          )}

          {chatProcurementLoading ? "Confirming..." : "Confirm Purchase Order"}

        </button>

        <button

          type="button"

          disabled={chatProcurementLoading}

          onClick={() => {

            setChatProcurement(null);

            setMessages((previous) => [

              ...previous,

              {

                role: "assistant",

                content:

                  "Procurement confirmation dismissed. No purchase order was created by this action.",

              },

            ]);

          }}

          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-slate-900 disabled:opacity-50"

        >

          <X size={15} />

          Cancel

        </button>

      </div>

    </div>

  </div>

)}

            {/* Purchase Order Confirmation */}

            {pendingAction?.type ===

              "CREATE_PURCHASE_ORDER" && (

              <div className="border-t border-amber-900/40 bg-amber-950/10 p-4">

                <div className="rounded-2xl border border-amber-900/50 bg-slate-950 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-950 text-amber-400">

                      <AlertTriangle

                        size={20}

                      />

                    </div>

                    <div className="flex-1">

                      <h3 className="text-sm font-semibold text-white">

                        Purchase Order Confirmation

                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">

                        Gideon is ready to create

                        a purchase order. Review

                        the details before confirming.

                      </p>

                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    {pendingAction.draft.products.map(

                      (product) => (

                        <div

                          key={product.productId}

                          className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"

                        >

                          <div className="flex items-center justify-between gap-3">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-950 text-violet-400">

                                <Package

                                  size={16}

                                />

                              </div>

                              <div>

                                <p className="text-xs font-medium text-white">

                                  {product.name}

                                </p>

                                <p className="text-[10px] text-slate-600">

                                  {product.sku}

                                </p>

                              </div>

                            </div>

                            <div className="text-right">

                              <p className="text-xs font-semibold text-amber-400">

                                +

                                {

                                  product.suggestedQuantity

                                }{" "}

                                units

                              </p>

                              <p className="text-[10px] text-slate-600">

                                Stock:{" "}

                                {

                                  product.currentStock

                                }{" "}

                                / Reorder:{" "}

                                {

                                  product.reorderLevel

                                }

                              </p>

                            </div>

                          </div>

                        </div>

                      )

                    )}

                  </div>

                  <div className="mt-4 rounded-xl bg-slate-900 p-3">

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-slate-500">

                        Products

                      </span>

                      <span className="font-medium text-white">

                        {

                          pendingAction.draft

                            .products.length

                        }

                      </span>

                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">

                      <span className="text-slate-500">

                        Supplier

                      </span>

                      <span className="font-medium text-white">

                        {[

                          ...new Set(

                            pendingAction.draft.products

                              .map((product) => product.supplier?.trim())

                              .filter((name): name is string => Boolean(name))

                          ),

                        ].join(", ") || "Supplier must be verified"}

                      </span>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-3">

                    <button

                      type="button"

                      onClick={

                        confirmPurchaseOrder

                      }

                      disabled={

                        actionLoading

                      }

                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"

                    >

                      {actionLoading ? (

                        <Loader2

                          size={15}

                          className="animate-spin"

                        />

                      ) : (

                        <Check size={15} />

                      )}

                      {actionLoading

                        ? "Creating..."

                        : "Confirm & Create PO"}

                    </button>

                    <button

                      type="button"

                      onClick={

                        cancelAction

                      }

                      disabled={

                        actionLoading

                      }

                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-xs font-semibold text-slate-400 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"

                    >

                      <X size={15} />

                      Cancel

                    </button>

                  </div>

                  <p className="mt-3 text-center text-[10px] text-slate-600">

                    No ERP data will change until

                    you confirm.

                  </p>

                </div>

              </div>

            )}

            {/* Input */}

            <div className="border-t border-slate-800 p-4">

              <div className="flex items-end gap-3 rounded-xl border border-slate-800 bg-slate-900 p-2 focus-within:border-violet-700">

                <textarea

                  value={message}

                  onChange={(event) =>

                    setMessage(

                      event.target.value

                    )

                  }

                  onKeyDown={(event) => {

                    if (

                      event.key === "Enter" &&

                      !event.shiftKey

                    ) {

                      event.preventDefault();

                      sendMessage();

                    }

                  }}

                  placeholder="Ask Gideon anything about your business..."

                  rows={1}

                  disabled={

                    loading ||

                    actionLoading

                  }

                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"

                />

                <button

                  type="button"

                  onClick={() =>

                    sendMessage()

                  }

                  disabled={

                    !message.trim() ||

                    loading ||

                    actionLoading

                  }

                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"

                >

                  {loading ? (

                    <Loader2

                      size={17}

                      className="animate-spin"

                    />

                  ) : (

                    <Send size={17} />

                  )}

                </button>

              </div>

              <p className="mt-2 text-center text-[10px] text-slate-700">

                Gideon can make mistakes. Verify

                important business decisions before

                execution.

              </p>

            </div>

          </section>

          {/* Right Panel */}

          <aside className="space-y-6">

            {/* Agent Status */}

            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

              <div className="flex items-center gap-3">

                <BrainCircuit

                  size={18}

                  className="text-violet-400"

                />

                <div>

                  <h2 className="text-sm font-semibold text-white">

                    Agent Orchestration

                  </h2>

                  <p className="text-[11px] text-slate-600">

                    Real-time agent routing

                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                {allAgents.map(

                  (agent, index) => {

                    const info =

                      agentInfo[agent];

                    const Icon =

                      info.icon;

                    const status =

                      getAgentStatus(

                        agent

                      );

                    return (

                      <div

                        key={agent}

                        className="relative flex gap-3"

                      >

                        {index <

                          allAgents.length -

                            1 && (

                          <div className="absolute left-4 top-9 h-7 w-px bg-slate-800" />

                        )}

                        <div

                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${

                            status ===

                            "active"

                              ? "bg-violet-900 text-violet-300"

                              : status ===

                                "completed"

                              ? "bg-emerald-950 text-emerald-400"

                              : "bg-slate-900 text-slate-600"

                          }`}

                        >

                          {status ===

                          "active" ? (

                            <Loader2

                              size={15}

                              className="animate-spin"

                            />

                          ) : (

                            <Icon

                              size={15}

                            />

                          )}

                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p

                              className={`text-xs font-medium ${

                                status ===

                                "idle"

                                  ? "text-slate-600"

                                  : "text-slate-300"

                              }`}

                            >

                              {

                                info.name

                              }

                            </p>

                            {status ===

                              "completed" && (

                              <CheckCircle2

                                size={13}

                                className="text-emerald-400"

                              />

                            )}

                            {status ===

                              "active" && (

                              <span className="text-[9px] font-medium text-violet-400">

                                ACTIVE

                              </span>

                            )}

                          </div>

                          <p className="mt-1 text-[11px] leading-5 text-slate-600">

                            {status ===

                            "active"

                              ? info.description

                              : status ===

                                "completed"

                              ? "Completed analysis."

                              : "Waiting for request..."}

                          </p>

                        </div>

                      </div>

                    );

                  }

                )}

              </div>

              {lastAgent && (

                <div className="mt-5 rounded-xl border border-violet-900/40 bg-violet-950/20 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-violet-500">

                    Last Agent Used

                  </p>

                  <p className="mt-1 text-xs font-medium text-violet-300">

                    {

                      agentInfo[

                        lastAgent

                      ].name

                    }

                  </p>

                </div>

              )}

            </section>

            {/* Capabilities */}

            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

              <h2 className="text-sm font-semibold text-white">

                Gideon Capabilities

              </h2>

              <div className="mt-5 space-y-3">

                {[

                  "ERP data analysis",

                  "Inventory intelligence",

                  "Supplier comparison",

                  "Financial analysis",

                  "Customer insights",

                  "Enterprise document search",

                  "Business recommendations",

                  "Purchase order preparation",

                ].map(

                  (capability) => (

                    <div

                      key={capability}

                      className="flex items-center gap-2 text-xs text-slate-400"

                    >

                      <CheckCircle2

                        size={14}

                        className="text-violet-500"

                      />

                      {capability}

                    </div>

                  )

                )}

              </div>

            </section>

            {/* Activity */}

            <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

              <div className="flex items-center gap-3">

                <Clock3

                  size={17}

                  className="text-slate-500"

                />

                <h2 className="text-sm font-semibold text-white">

                  System Activity

                </h2>

              </div>

              <div className="mt-5 space-y-4">

                {lastAgent ? (

                  <div className="border-l border-violet-800 pl-3">

                    <p className="text-xs text-slate-300">

                      {

                        agentInfo[

                          lastAgent

                        ].name

                      }{" "}

                      processed your latest request

                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">

                      Just now

                    </p>

                  </div>

                ) : (

                  <div className="border-l border-slate-800 pl-3">

                    <p className="text-xs text-slate-500">

                      No AI activity yet

                    </p>

                    <p className="mt-1 text-[10px] text-slate-700">

                      Ask Gideon a question to begin

                    </p>

                  </div>

                )}

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>

  );

}
