
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { success: false, message: "Backend API URL is not configured." },
      { status: 500 }
    );
  }

  let credentials: { email?: string; password?: string };

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const email =
    typeof credentials.email === "string"
      ? credentials.email.trim()
      : "";

  const password =
    typeof credentials.password === "string"
      ? credentials.password
      : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    const result = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok || !result?.success || !result?.data?.token) {
      return NextResponse.json(
        {
          success: false,
          message: result?.message || "Login failed. Check your credentials.",
        },
        { status: backendResponse.status >= 400 && backendResponse.status < 500
            ? backendResponse.status
            : 502 }
      );
    }

    const { token, expiresIn, user } = result.data;

    if (
      typeof token !== "string" ||
      typeof user?.id !== "string" ||
      typeof user?.email !== "string" ||
      typeof user?.role !== "string" ||
      typeof user?.name !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Unexpected login response from backend." },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("agentflow_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        typeof expiresIn === "number" && expiresIn > 0
          ? Math.min(expiresIn, 3600)
          : 3600,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot connect to the backend. Check that the API server is running." },
      { status: 502 }
    );
  }
}
