import type { LucideIcon } from "lucide-react";
import { Plus, Search } from "lucide-react";

interface ModulePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export default function ModulePage({
  title,
  description,
  icon: Icon,
  actionLabel = "Create New",
  onAction,
  children,
}: ModulePageProps) {
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-950/60 text-violet-400">
              <Icon size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                {title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAction}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            <Plus size={17} />
            {actionLabel}
          </button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </main>
  );
}