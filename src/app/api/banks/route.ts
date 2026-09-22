import { getCurrentUser } from "@/helpers/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      "https://api.paystack.co/bank?country=nigeria",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch banks",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      banks: data.data,
    });
  } catch (error) {
    console.error("Banks API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch banks",
      },
      { status: 500 }
    );
  }
}