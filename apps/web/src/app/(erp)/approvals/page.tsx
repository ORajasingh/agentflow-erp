import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const approvals = [
  {
    id: "APR-1001",
    title: "Purchase Order",
    description: "Dell Latitude 5450 — 58 units",
    department: "Procurement",
    requester: "Procurement Agent",
    amount: "₹27.84L",
    risk: "Medium",
    status: "Pending",
    created: "12 min ago",
  },
  {
    id: "APR-1002",
    title: "Budget Adjustment",
    description: "Increase procurement budget",
    department: "Finance",
    requester: "Finance Agent",
    amount: "₹15.00L",
    risk: "High",
    status: "Pending",
    created: "32 min ago",
  },
  {
    id: "APR-1003",
    title: "Supplier Selection",
    description: "Recommended supplier: Dell Technologies",
    department: "Procurement",
    requester: "Procurement Agent",
    amount: "₹27.84L",
    risk: "Low",
    status: "Approved",
    created: "1 hour ago",
  },
  {
    id: "APR-1004",
    title: "Customer Discount",
    description: "Preferred pricing for ABC Electronics",
    department: "Sales",
    requester: "Sales Agent",
    amount: "8% discount",
    risk: "Low",
    status: "Rejected",
    created: "2 hours ago",
  },
];

const statusStyles = {
  Pending: "bg-amber-950 text-amber-400",
  Approved: "bg-emerald-950 text-emerald-400",
  Rejected: "bg-red-950 text-red-400",
};

export default function ApprovalsPage() {
  const pendingCount = approvals.filter(
    (approval) => approval.status === "Pending"
  ).length;

  const approvedCount = approvals.filter(
    (approval) => approval.status === "Approved"
  ).length;

  const rejectedCount = approvals.filter(
    (approval) => approval.status === "Rejected"
  ).length;

  return (
    <ModulePage
      title="Approvals"
      description="Review and control AI-generated business actions before execution."
      icon={FileCheck2}
      actionLabel="View Audit Log"
    >
      {/* Approval summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <div className="rounded-xl bg-amber-950/50 p-2 text-amber-400">
              <Clock3 size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {pendingCount}
          </p>

          <p className="mt-2 text-xs text-amber-400">
            Requires attention
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Approved
            </p>

            <div className="rounded-xl bg-emerald-950/50 p-2 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {approvedCount}
          </p>

          <p className="mt-2 text-xs text-emerald-400">
            Successfully approved
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Rejected
            </p>

            <div className="rounded-xl bg-red-950/50 p-2 text-red-400">
              <XCircle size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            {rejectedCount}
          </p>

          <p className="mt-2 text-xs text-red-400">
            Actions rejected
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              AI Controlled
            </p>

            <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
              <ShieldCheck size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            100%
          </p>

          <p className="mt-2 text-xs text-violet-400">
            Human approval enabled
          </p>
        </div>
      </div>

      {/* HITL explanation */}
      <div className="mt-6 rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-violet-950 p-3 text-violet-400">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Human-in-the-Loop Control
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
              Gideon and specialized AI agents can analyze enterprise
              data and recommend actions. High-impact operations are
              paused until an authorized human reviews the reasoning
              and approves the action.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                AI Recommendation
              </span>

              <span className="text-slate-600">→</span>

              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                Risk Evaluation
              </span>

              <span className="text-slate-600">→</span>

              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                Human Review
              </span>

              <span className="text-slate-600">→</span>

              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
                Execute
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval queue */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Approval Queue
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            AI-generated actions waiting for human review.
          </p>
        </div>

        <div className="divide-y divide-slate-800">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="p-6 transition hover:bg-slate-900/40"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 rounded-xl p-2.5 ${
                      approval.status === "Pending"
                        ? "bg-amber-950 text-amber-400"
                        : approval.status === "Approved"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-red-950 text-red-400"
                    }`}
                  >
                    {approval.status === "Pending" ? (
                      <AlertTriangle size={19} />
                    ) : approval.status === "Approved" ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <XCircle size={19} />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-white">
                        {approval.title}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                          statusStyles[
                            approval.status as keyof typeof statusStyles
                          ]
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {approval.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span>
                        ID:{" "}
                        <span className="text-slate-400">
                          {approval.id}
                        </span>
                      </span>

                      <span>
                        Department:{" "}
                        <span className="text-slate-400">
                          {approval.department}
                        </span>
                      </span>

                      <span>
                        Agent:{" "}
                        <span className="text-violet-400">
                          {approval.requester}
                        </span>
                      </span>

                      <span>
                        Created:{" "}
                        <span className="text-slate-400">
                          {approval.created}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:min-w-56">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Impact
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {approval.amount}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        approval.risk === "High"
                          ? "bg-red-950 text-red-400"
                          : approval.risk === "Medium"
                            ? "bg-amber-950 text-amber-400"
                            : "bg-emerald-950 text-emerald-400"
                      }`}
                    >
                      {approval.risk} Risk
                    </span>
                  </div>

                  {approval.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        className="flex-1 rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-950"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {approval.status !== "Pending" && (
                    <button
                      type="button"
                      className="w-full rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModulePage>
  );
}