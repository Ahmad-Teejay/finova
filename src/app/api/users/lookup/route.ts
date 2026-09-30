import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/helpers/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const accountNumber = request.nextUrl.searchParams.get("accountNumber");

    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number is required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number must be 10 digits",
        },
        { status: 400 }
      );
    }

    await connect();

    const recipient = await User.findOne({
      accountNumber,
    }).select("fullName accountNumber username");

    if (!recipient) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found",
        },
        { status: 404 }
      );
    }

    if (recipient._id.toString() === currentUser.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot transfer money to yourself",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        recipient: {
          fullName: recipient.fullName,
          accountNumber: recipient.accountNumber,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to lookup account",
      },
      { status: 500 }
    );
  }
}