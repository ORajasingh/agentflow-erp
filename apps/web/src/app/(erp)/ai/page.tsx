"use client";

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  MessageSquare,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { useState } from "react";

const suggestions = [
  "Which products are running low?",
  "Can we afford the current purchase orders?",
  "Why did sales change this month?",
  "Find the best supplier for Dell laptops.",
];

const reasoningSteps = [
  {
    agent: "Inventory Agent",
    description: "Checking current stock levels...",
    icon: Database,
    status: "completed",
  },
  {
    agent: "Procurement Agent",
    description: "Analyzing supplier availability...",
    icon: FileSearch,
    status: "completed",
  },
  {
    agent: "Finance Agent",
    description: "Checking budget impact...",
    icon: BrainCircuit,
    status: "completed",
  },
];

export default function AICommandCenterPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const sendMessage = (text?: string) => {
    const value = (text ?? message).trim();

    if (!value) return;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: value,
      },
      {
        role: "assistant",
        content:
          "I received your request. The AI agent system will process this query once the backend and agent services are connected.",
      },
    ]);

    setMessage("");
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
            {/* Chat header */}
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
                onClick={() => setMessages([])}
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
                    Ask Gideon about sales, inventory, procurement,
                    finance, customers, employees, or enterprise
                    documents.
                  </p>

                  <div className="mt-7 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left transition hover:border-violet-800 hover:bg-violet-950/20"
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
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((item, index) => (
                    <div
                      key={`${item.role}-${index}`}
                      className={`flex gap-3 ${
                        item.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {item.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-950 text-violet-400">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          item.role === "user"
                            ? "bg-violet-600 text-white"
                            : "border border-slate-800 bg-slate-900 text-slate-300"
                        }`}
                      >
                        {item.content}
                      </div>

                      {item.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 p-4">
              <div className="flex items-end gap-3 rounded-xl border border-slate-800 bg-slate-900 p-2 focus-within:border-violet-700">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
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
                  className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!message.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={17} />
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] text-slate-700">
                Gideon can make mistakes. Verify important business
                decisions before execution.
              </p>
            </div>
          </section>

          {/* Reasoning panel */}
          <aside className="space-y-6">
            {/* Agent status */}
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
                    Multi-agent reasoning pipeline
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {reasoningSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.agent}
                      className="relative flex gap-3"
                    >
                      {index <
                        reasoningSteps.length - 1 && (
                        <div className="absolute left-4 top-9 h-7 w-px bg-slate-800" />
                      )}

                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-950 text-violet-400">
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-slate-300">
                            {step.agent}
                          </p>

                          <CheckCircle2
                            size={13}
                            className="text-emerald-400"
                          />
                        </div>

                        <p className="mt-1 text-[11px] leading-5 text-slate-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                ].map((capability) => (
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
                ))}
              </div>
            </section>

            {/* Last activity */}
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
                <div className="border-l border-violet-800 pl-3">
                  <p className="text-xs text-slate-300">
                    Inventory Agent checked stock levels
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    2 minutes ago
                  </p>
                </div>

                <div className="border-l border-blue-800 pl-3">
                  <p className="text-xs text-slate-300">
                    Finance Agent analyzed budget
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    5 minutes ago
                  </p>
                </div>

                <div className="border-l border-emerald-800 pl-3">
                  <p className="text-xs text-slate-300">
                    Procurement Agent evaluated suppliers
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    8 minutes ago
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}