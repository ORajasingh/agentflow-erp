
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type UserRole =
  | "admin"
  | "manager"
  | "hr"
  | "sales_manager"
  | "employee";

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

const roleDestinations: Record<UserRole, string> = {
  admin: "/dashboard",
  manager: "/dashboard",
  hr: "/hr",
  sales_manager: "/sales",
  employee: "/dashboard",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.message || "Unable to sign in.");
      }

      const destination = roleDestinations[result.user.role];

      if (!destination) {
        throw new Error("Your account has an unsupported role.");
      }

      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b19] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-10 lg:flex">
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-12 top-36 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
              <Sparkles size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AgentFlow</h1>
              <p className="text-xs tracking-[0.2em] text-white/65">
                ENTERPRISE OS
              </p>
            </div>
          </div>

          <div className="relative my-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <ShieldCheck size={34} />
            </div>
            <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
              One workspace.
              <br />
              Smarter business.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Bring your enterprise workflows, insights, and AI-powered
              operations together in one secure workspace.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/65">
            <LockKeyhole size={14} />
            Secure access to your workspace
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold">AgentFlow</h1>
              <p className="text-[10px] tracking-[0.2em] text-slate-400">
                ENTERPRISE OS
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Welcome back
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Sign in to AgentFlow
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter your work credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Work email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={254}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to workspace"}
              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-emerald-400"
            />
            <p className="text-xs leading-5 text-slate-400">
              Your access permissions are determined by your account role.
              Contact your administrator if you need account assistance.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-600">
            AgentFlow ERP · Secure enterprise workspace
          </p>
        </section>
      </div>
    </main>
  );
}
