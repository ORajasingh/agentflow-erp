import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{8,100}$/;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!OBJECT_ID_PATTERN.test(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid procurement request ID.",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("agentflow_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Your session has expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const sessionId = body?.sessionId;

    if (
      typeof sessionId !== "string" ||
      !SESSION_ID_PATTERN.test(sessionId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid conversation session ID is required.",
        },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `${API_URL}/api/ai/procurement/${id}/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
        cache: "no-store",
      }
    );

    const responseBody = await upstream
      .json()
      .catch(() => ({
        success: false,
        message: "The API returned an invalid response.",
      }));

    return NextResponse.json(responseBody, {
      status: upstream.status,
    });
  } catch (error) {
    console.error("Procurement confirmation proxy failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the procurement service.",
      },
      { status: 502 }
    );
  }
}