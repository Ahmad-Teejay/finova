import { connect } from "@/dbConfig/dbConfig";
import { getCurrentUser } from "@/helpers/auth";
import Transaction from "@/models/transactionModel";
import Wallet from "@/models/walletModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const reference = request.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required",
        },
        { status: 400 }
      );
    }

    const existingTransaction = await Transaction.findOne({
      reference,
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
      });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
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
          message: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    const payment = data.data;

    if (payment.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment was not successful",
        },
        { status: 400 }
      );
    }

    if (payment.customer.email !== user.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment does not belong to this user",
        },
        { status: 403 }
      );
    }

    const amount = payment.amount / 100;

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const wallet = await Wallet.findOne({
        user: user.userId,
      }).session(session);

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      wallet.balance += amount;

      await wallet.save({ session });

      await Transaction.create(
        [
          {
            user: user.userId,
            type: "credit",
            category: "deposit",
            amount,
            description: "Wallet deposit",
            status: "success",
            reference,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Wallet funded successfully",
        amount,
        balance: wallet.balance,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}