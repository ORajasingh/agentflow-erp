"use client";
import {
  BarChart3,
  Boxes,
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "AI Command Center",
        href: "/ai",
        icon: Bot,
      },
    ],
  },
  {
    label: "Enterprise",
    items: [
      {
        name: "CRM",
        href: "/crm",
        icon: Users,
      },
      {
        name: "Sales",
        href: "/sales",
        icon: ShoppingCart,
      },
      {
        name: "Inventory",
        href: "/inventory",
        icon: Boxes,
      },
      {
        name: "Procurement",
        href: "/procurement",
        icon: PackageSearch,
      },
      {
        name: "Finance",
        href: "/finance",
        icon: CircleDollarSign,
      },
      {
        name: "HR",
        href: "/hr",
        icon: Building2,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        name: "Knowledge Base",
        href: "/knowledge",
        icon: FileText,
      },
      {
        name: "Approvals",
        href: "/approvals",
        icon: ClipboardCheck,
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  return (
    <aside
      className={`flex min-h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white">
              A
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                AgentFlow
              </h1>

              <p className="text-[10px] font-medium tracking-wider text-slate-400">
                ENTERPRISE OS
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {navigation.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
               const active =
  pathname === item.href ||
  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                return (
                <Link
  key={item.name}
  href={item.href}
  title={collapsed ? item.name : undefined}
  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
    active
      ? "bg-violet-50 font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
  }`}
>
  <Icon size={18} />

  {!collapsed && <span>{item.name}</span>}
</Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          title={collapsed ? "Settings" : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Settings size={18} />

          {!collapsed && <span>Settings</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                AI System Online
              </p>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              All systems operational
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}