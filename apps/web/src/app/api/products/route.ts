import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("agentflow_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please log in again." },
        { status: 401 }
      );
    }

    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000";

    const response = await fetch(`${apiUrl}/api/products`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Products proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch products." },
      { status: 500 }
    );
  }
}