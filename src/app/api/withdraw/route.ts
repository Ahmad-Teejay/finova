import { connect } from "@/dbConfig/dbConfig";
import { getCurrentUser } from "@/helpers/auth";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import mongoose from "mongoose";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

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

    const {
      bankName,
      bankCode,
      accountNumber,
      amount,
    } = reqBody;

    const numericAmount = Number(amount);

    // Validate bank name
    if (!bankName) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank name is required",
        },
        { status: 400 }
      );
    }

    // Validate bank code
    if (!bankCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Bank code is required",
        },
        { status: 400 }
      );
    }

    // Validate account number
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

    // Validate amount
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount",
        },
        { status: 400 }
      );
    }

    if (numericAmount < 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum withdrawal amount is ₦100",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 1
     * Check the user's wallet before contacting Paystack.
     */

    const wallet = await Wallet.findOne({
      user: user.userId,
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found",
        },
        { status: 404 }
      );
    }

    if (wallet.balance < numericAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 2
     * Create Paystack transfer recipient.
     */

    const recipientResponse = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name: reqBody.accountName || "Finova User",
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        }),
      }
    );

    const recipientData = await recipientResponse.json();

    if (!recipientResponse.ok || !recipientData.status) {
      console.error(
        "Paystack recipient error:",
        recipientData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            recipientData.message ||
            "Failed to create transfer recipient",
        },
        { status: 400 }
      );
    }

    const recipientCode =
      recipientData.data.recipient_code;

    /*
     * STEP 3
     * Generate a unique Paystack transfer reference.
     *
     * Paystack requires the reference to use
     * lowercase letters, numbers, "-" or "_".
     */

    const reference = `withdraw-${crypto.randomUUID()}`;

    /*
     * STEP 4
     * Initiate the actual Paystack transfer.
     *
     * NGN amount must be converted to kobo.
     */

    const transferResponse = await fetch(
      "https://api.paystack.co/transfer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: Math.round(numericAmount * 100),
          recipient: recipientCode,
          reason: `Finova withdrawal to ${bankName}`,
          reference,
          currency: "NGN",
        }),
      }
    );

    const transferData = await transferResponse.json();

    if (!transferResponse.ok || !transferData.status) {
      console.error(
        "Paystack transfer error:",
        transferData
      );

      return NextResponse.json(
        {
          success: false,
          message:
            transferData.message ||
            "Failed to initiate withdrawal",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 5
     * Paystack accepted the transfer.
     *
     * Now deduct the money and create a pending
     * transaction in Finova.
     */

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const currentWallet = await Wallet.findOne({
        user: user.userId,
      }).session(session);

      if (!currentWallet) {
        throw new Error("Wallet not found");
      }

      if (currentWallet.balance < numericAmount) {
        throw new Error("Insufficient balance");
      }

      currentWallet.balance -= numericAmount;

      await currentWallet.save({
        session,
      });

      await Transaction.create(
        [
          {
            user: user.userId,
            type: "debit",
            category: "withdrawal",
            amount: numericAmount,
            description: `Withdrawal to ${bankName} - ****${accountNumber.slice(
              -4
            )}`,
            status: "pending",
            reference,
          },
        ],
        {
          session,
          ordered: true,
        }
      );

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Withdrawal initiated successfully",
        reference,
        status: transferData.data.status,
      });
    } catch (error) {
      await session.abortTransaction();

      console.error(
        "Withdrawal database transaction error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to save withdrawal",
        },
        { status: 500 }
      );
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Withdrawal API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process withdrawal",
      },
      { status: 500 }
    );
  }
}