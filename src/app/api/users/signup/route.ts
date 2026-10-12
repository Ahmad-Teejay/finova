import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import { sendVerificationEmail } from "@/helpers/mailer";
import bcryptjs from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function generateUniqueAccountNumber() {
  let accountNumber = generateAccountNumber();

  while (await User.exists({ accountNumber })) {
    accountNumber = generateAccountNumber();
  }

  return accountNumber;
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const reqBody = await request.json();
    const { fullName, username, phone, password } = reqBody;

    const email =
      typeof reqBody.email === "string"
        ? reqBody.email.trim().toLowerCase()
        : "";

    if (
      !fullName?.trim?.() ||
      !username?.trim?.() ||
      !email ||
      !phone?.trim?.() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Full name, username, email, phone and password are required",
        },
        { status: 400 }
      );
    }

    if (
        typeof password !== "string" ||
        password.length < 8 ||
        !/[A-Za-z]/.test(password) ||
        !/[0-9]/.test(password)
        ) {
        return NextResponse.json(
            {
            success: false,
            message:
                "Password must be at least 8 characters and contain at least one letter and one number",
            },
            { status: 400 }
        );
    }   

    const existingUser = await User.findOne({
      $or: [
        { username: username.trim() },
        { email },
        { phone: phone.trim() },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email or phone number already exists",
        },
        { status: 409 }
      );
    }

    const accountNumber = await generateUniqueAccountNumber();

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Generate a secure, random verification token.
    const verificationToken = randomBytes(32).toString("hex");

    // Store only the token's SHA-256 hash in MongoDB.
    const verificationTokenHash = createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const verificationTokenExpires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    const newUser = await User.create({
      fullName: fullName.trim(),
      username: username.trim(),
      email,
      phone: phone.trim(),
      accountNumber,
      password: hashedPassword,
      isVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationTokenExpires: verificationTokenExpires,
    });

    let newWallet;

    try {
      newWallet = await Wallet.create({
        user: newUser._id,
        balance: 0,
        currency: "NGN",
      });

      const appUrl = process.env.APP_URL || "http://localhost:3001";

      const verificationUrl = new URL(
        "/verify-email",
        appUrl
      );

      verificationUrl.searchParams.set("token", verificationToken);

      await sendVerificationEmail(
        newUser.email,
        verificationUrl.toString()
      );
    } catch (emailOrWalletError) {
      // Avoid leaving a partially registered account if setup fails.
      if (newWallet) {
        await Wallet.deleteOne({ _id: newWallet._id });
      }

      await User.deleteOne({ _id: newUser._id });

      throw emailOrWalletError;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created. Check your Mailtrap testing inbox for the verification link.",
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          username: newUser.username,
          email: newUser.email,
          isVerified: newUser.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Signup failed. Please try again.",
      },
      { status: 500 }
    );
  }
}