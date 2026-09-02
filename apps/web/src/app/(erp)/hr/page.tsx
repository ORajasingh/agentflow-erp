import {
  Building2,
  CalendarDays,
  Clock3,
  UserCheck,
  Users,
  UserPlus,
} from "lucide-react";

import ModulePage from "@/components/layout/ModulePage";

const employees = [
  {
    id: "EMP-001",
    name: "Arun Kumar",
    department: "Engineering",
    role: "Senior Developer",
    status: "Active",
    joining: "12 Jan 2023",
  },
  {
    id: "EMP-002",
    name: "Priya Sharma",
    department: "Finance",
    role: "Financial Analyst",
    status: "Active",
    joining: "04 Mar 2024",
  },
  {
    id: "EMP-003",
    name: "Rahul Menon",
    department: "Sales",
    role: "Sales Executive",
    status: "On Leave",
    joining: "18 Jul 2022",
  },
  {
    id: "EMP-004",
    name: "Divya Raj",
    department: "HR",
    role: "HR Manager",
    status: "Active",
    joining: "22 Nov 2021",
  },
  {
    id: "EMP-005",
    name: "Karthik S",
    department: "Procurement",
    role: "Procurement Officer",
    status: "Active",
    joining: "10 Aug 2024",
  },
];

const summary = [
  {
    title: "Total Employees",
    value: "248",
    icon: Users,
  },
  {
    title: "Present Today",
    value: "231",
    icon: UserCheck,
  },
  {
    title: "On Leave",
    value: "17",
    icon: CalendarDays,
  },
  {
    title: "New This Month",
    value: "4",
    icon: UserPlus,
  },
];

export default function HRPage() {
  return (
    <ModulePage
      title="Human Resources"
      description="Manage employees, attendance, leave, and organizational workforce."
      icon={Building2}
      actionLabel="Add Employee"
    >
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <div className="rounded-xl bg-violet-950/50 p-2 text-violet-400">
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-white">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Workforce overview */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Workforce Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Employee distribution across departments.
              </p>
            </div>

            <Users size={20} className="text-violet-400" />
          </div>

          <div className="mt-6 space-y-5">
            {[
              {
                department: "Engineering",
                employees: 82,
                percentage: 33,
              },
              {
                department: "Sales",
                employees: 54,
                percentage: 22,
              },
              {
                department: "Finance",
                employees: 31,
                percentage: 13,
              },
              {
                department: "Operations",
                employees: 45,
                percentage: 18,
              },
              {
                department: "HR & Administration",
                employees: 36,
                percentage: 14,
              },
            ].map((department) => (
              <div key={department.department}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    {department.department}
                  </span>

                  <span className="text-xs text-slate-500">
                    {department.employees} employees
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                    style={{
                      width: `${department.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-950 p-2 text-violet-400">
              <Clock3 size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Today's Attendance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current workforce status
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-8 border-violet-600/30">
              <span className="text-3xl font-bold text-white">
                93%
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Attendance
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-xs text-slate-500">
                Present
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-400">
                231
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-xs text-slate-500">
                Leave
              </p>

              <p className="mt-1 text-lg font-semibold text-amber-400">
                17
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employees */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-4">
          <h2 className="font-semibold text-white">
            Employees
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recently active employees.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">
                  Employee
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Department
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Role
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Joining Date
                </th>

                <th className="px-6 py-4 font-medium text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {employee.name}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-slate-600">
                        {employee.id}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {employee.department}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {employee.role}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {employee.joining}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        employee.status === "Active"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModulePage>
  );
}
