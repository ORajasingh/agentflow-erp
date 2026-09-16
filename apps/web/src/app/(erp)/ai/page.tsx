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
} from "lucide-react";

import { useState } from "react";

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
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const [activeAgent, setActiveAgent] =
    useState<AgentName>("general");

  const [lastAgent, setLastAgent] =
    useState<AgentName | null>(null);

  const sendMessage = async (text?: string) => {
    const value = (text ?? message).trim();

    if (!value || loading) return;

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
        "http://localhost:4000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: value,

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
    } catch (error) {
      console.error(
        "AI chat error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the AI service. Please make sure the API server is running on port 4000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAgentStatus = (
    agent: AgentName
  ) => {
    if (loading && activeAgent === agent) {
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
                    Ask Gideon about sales, inventory,
                    procurement, finance, customers,
                    employees, or enterprise documents.
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
                          disabled={loading}
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
                  disabled={loading}
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    sendMessage()
                  }
                  disabled={
                    !message.trim() ||
                    loading
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
                Gideon can make mistakes. Verify important business
                decisions before execution.
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
                  "Explainable decisions",
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