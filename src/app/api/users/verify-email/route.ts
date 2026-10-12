import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = request.nextUrl.searchParams.get("token");

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link.",
        },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpires: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "This verification link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpires = null;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify your email. Please try again.",
      },
      { status: 500 }
    );
  }
}