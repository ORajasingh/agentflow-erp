
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const dynamic = "force-dynamic";

export default async function ERPLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("agentflow_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    redirect("/login");
  }

  let authenticated = false;

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.ok) {
      const result = await response.json();
      authenticated = result?.success === true && Boolean(result?.data?.id);
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        {children}
      </div>
    </div>
  );
}
