import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const ALLOWED_ACTIONS = [
  "approve",
  "reject",
  "order",
  "receive",
] as const;

export async function PATCH(request: NextRequest) {
  try {
    const token =
      request.cookies.get("agentflow_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is required.",
        },
        { status: 401 }
      );
    }

    const segments = request.nextUrl.pathname
      .split("/")
      .filter(Boolean);

    const orderId = segments.at(-2);
    const action = segments.at(-1);

    if (
      !orderId ||
      !action ||
      !ALLOWED_ACTIONS.includes(
        action as (typeof ALLOWED_ACTIONS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid purchase-order action.",
        },
        { status: 400 }
      );
    }

    const backendUrl =
      `${API_URL}/api/purchase-orders/` +
      `${encodeURIComponent(orderId)}/${action}`;

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    console.log("[PO Action Proxy] Backend URL:", backendUrl);
    console.log("[PO Action Proxy] HTTP status:", response.status);

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error(
        "[PO Action Proxy] Backend returned non-JSON:",
        responseText.slice(0, 200)
      );

      return NextResponse.json(
        {
          success: false,
          message: "The backend returned a non-JSON response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("Purchase-order action proxy error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the purchase-order API.",
      },
      { status: 502 }
    );
  }
}