"use client";

import { Bell, Search, Sparkles } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-950"
        />
      </div>

      {/* Right actions */}
      <div className="ml-6 flex items-center gap-3">
        {/* AI Assistant */}
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100 sm:flex dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950"
        >
          <Sparkles size={16} />
          AI Assistant
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-600" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
            AD
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Admin
            </p>

            <p className="text-[11px] text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}