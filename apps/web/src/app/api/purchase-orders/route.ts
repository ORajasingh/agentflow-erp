import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

async function forwardRequest(
  request: NextRequest,
  method: "GET" | "POST"
) {
  try {
const token = request.cookies.get("agentflow_session")?.value;

console.log("[PO Proxy] Request method:", method);
console.log("[PO Proxy] Cookie present:", Boolean(token));
console.log("[PO Proxy] Backend URL:", API_URL);

if (!token) {
  console.log("[PO Proxy] Missing agentflow_session cookie");
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is required. Please log in again.",
        },
        { status: 401 }
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (method === "POST") {
      const body = await request.json();
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    console.log(
  "[PO Proxy] Authorization header set:",
  Boolean(options.headers)
);

    const response = await fetch(
      `${API_URL}/api/purchase-orders`,
      options
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Purchase orders ${method} proxy error:`, error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the purchase-order API.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return forwardRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return forwardRequest(request, "POST");
}