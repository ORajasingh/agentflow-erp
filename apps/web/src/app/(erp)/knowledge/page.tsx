import {
  BookOpen,
  FileText,
  FolderOpen,
  Search,
  Upload,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const documents = [
  {
    name: "Company Policy Handbook",
    category: "Policies",
    type: "PDF",
    size: "2.4 MB",
    updated: "Today",
    status: "Indexed",
  },
  {
    name: "Product Catalogue 2026",
    category: "Products",
    type: "PDF",
    size: "8.7 MB",
    updated: "Yesterday",
    status: "Indexed",
  },
  {
    name: "Supplier Agreement - Dell",
    category: "Procurement",
    type: "PDF",
    size: "1.8 MB",
    updated: "3 days ago",
    status: "Indexed",
  },
  {
    name: "Employee HR Guidelines",
    category: "HR",
    type: "DOCX",
    size: "1.2 MB",
    updated: "5 days ago",
    status: "Indexed",
  },
  {
    name: "Financial Procedures",
    category: "Finance",
    type: "PDF",
    size: "3.1 MB",
    updated: "1 week ago",
    status: "Processing",
  },
];

const categories = [
  {
    name: "Policies",
    count: 24,
  },
  {
    name: "Products",
    count: 86,
  },
  {
    name: "Procurement",
    count: 42,
  },
  {
    name: "HR",
    count: 31,
  },
  {
    name: "Finance",
    count: 28,
  },
];

export default function KnowledgePage() {
  return (
    <ModulePage
      title="Knowledge Base"
      description="Manage enterprise documents and knowledge used by Gideon's RAG system."
      icon={BookOpen}
      actionLabel="Upload Document"
    >
      {/* Knowledge statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Documents
            </p>

            <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
              <FileText size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            211
          </p>

          <p className="mt-2 text-xs text-emerald-400">
            +12 this month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Indexed Documents
            </p>

            <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
              <BookOpen size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            206
          </p>

          <p className="mt-2 text-xs text-emerald-400">
            97.6% indexed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Knowledge Categories
            </p>

            <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
              <FolderOpen size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            18
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Across all departments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              RAG Queries
            </p>

            <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
              <Search size={18} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-white">
            1,842
          </p>

          <p className="mt-2 text-xs text-emerald-400">
            This month
          </p>
        </div>
      </div>

      {/* RAG status */}
      <div className="mt-6 rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-950 p-3 text-violet-400">
              <BookOpen size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Gideon Knowledge Engine
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Enterprise documents are processed, converted into
                searchable knowledge, and retrieved when Gideon
                needs context to answer a business question.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            RAG System Ready
          </div>
        </div>
      </div>

      {/* Categories and documents */}
      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Categories */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="font-semibold text-white">
            Categories
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Browse enterprise knowledge
          </p>

          <div className="mt-5 space-y-2">
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <FolderOpen size={16} />

                  {category.name}
                </span>

                <span className="text-xs text-slate-600">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <h2 className="font-semibold text-white">
                Enterprise Documents
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Documents available to the knowledge engine.
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-700"
            >
              <Upload size={14} />
              Upload
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-400">
                    Document
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Category
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Type
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Size
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Updated
                  </th>

                  <th className="px-6 py-4 font-medium text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.name}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-900 p-2 text-slate-400">
                          <FileText size={16} />
                        </div>

                        <span className="font-medium text-white">
                          {document.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {document.category}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {document.type}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {document.size}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {document.updated}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          document.status === "Indexed"
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-amber-950 text-amber-400"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModulePage>
  );
}