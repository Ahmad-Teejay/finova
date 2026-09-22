import { getCurrentUser } from "@/helpers/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const accountNumber = request.nextUrl.searchParams.get("accountNumber");

    const bankCode = request.nextUrl.searchParams.get("bankCode");

    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number is required",
        },
        { status: 400 }
      );
    }

    if (!bankCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank code is required",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
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
          message: data.message || "Unable to verify bank account",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
    });
  } catch (error) {
    console.error("Bank account verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify bank account",
      },
      { status: 500 }
    );
  }
}