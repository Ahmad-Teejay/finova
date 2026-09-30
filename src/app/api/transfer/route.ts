import { connect } from "@/dbConfig/dbConfig";
import { getCurrentUser } from "@/helpers/auth";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connect();

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

    const reqBody = await request.json();

    const { recipient, amount, pin } = reqBody;

    const numericAmount = Number(amount);

    // -----------------------------
    // Validate PIN
    // -----------------------------

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction PIN is required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction PIN must be exactly 4 digits",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate recipient
    // -----------------------------

    if (!recipient) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipient is required",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Validate amount
    // -----------------------------

    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Find recipient
    // -----------------------------

    const recipientUser = await User.findOne({
      accountNumber: recipient,
    });

    if (!recipientUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Recipient not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Prevent self transfer
    // -----------------------------

    if (recipientUser._id.toString() === user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot send yourself money",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Find sender
    // -----------------------------

    const senderUser = await User.findById(user.userId);

    if (!senderUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Sender not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // Check if PIN exists
    // -----------------------------

    if (!senderUser.transactionPinHash) {
      return NextResponse.json(
        {
          success: false,
          message: "Please create your transaction PIN first",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Verify transaction PIN
    // -----------------------------

    const isPinValid = await bcryptjs.compare(
      pin,
      senderUser.transactionPinHash
    );

    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect transaction PIN",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Start wallet transaction
    // -----------------------------

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const senderWallet = await Wallet.findOne({
        user: user.userId,
      }).session(session);

      const recipientWallet = await Wallet.findOne({
        user: recipientUser._id,
      }).session(session);

      if (!senderWallet) {
        throw new Error("Sender wallet not found");
      }

      if (!recipientWallet) {
        throw new Error("Recipient wallet not found");
      }

      // -----------------------------
      // Check balance
      // -----------------------------

      if (senderWallet.balance < numericAmount) {
        throw new Error("Insufficient wallet balance");
      }

      // -----------------------------
      // Update wallets
      // -----------------------------

      senderWallet.balance -= numericAmount;
      recipientWallet.balance += numericAmount;

      await senderWallet.save({ session });
      await recipientWallet.save({ session });

      // -----------------------------
      // Create transaction references
      // -----------------------------

      const senderReference = `TRANSFER-${crypto.randomUUID()}`;

      const recipientReference = `TRANSFER-${crypto.randomUUID()}`;

      // -----------------------------
      // Create transaction records
      // -----------------------------

      await Transaction.create(
        [
          {
            user: user.userId,
            type: "debit",
            category: "transfer",
            amount: numericAmount,
            description: `Money sent to ${recipientUser.username}`,
            status: "success",
            reference: senderReference,
          },
          {
            user: recipientUser._id,
            type: "credit",
            category: "transfer",
            amount: numericAmount,
            description: `Money received from ${senderUser.username}`,
            status: "success",
            reference: recipientReference,
          },
        ],
        {
          session,
          ordered: true,
        }
      );

      // -----------------------------
      // Commit transaction
      // -----------------------------

      await session.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          message: "Money sent successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      await session.abortTransaction();

      console.error("Transfer transaction error:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Transfer failed",
        },
        { status: 400 }
      );
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Transfer error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Transfer failed",
      },
      { status: 500 }
    );
  }
}