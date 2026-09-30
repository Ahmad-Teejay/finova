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
      accountName,
      amount,
      idempotencyKey,
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

    if(!idempotencyKey){
      return NextResponse.json(
        {
          success: false,
          message: "IdemponcyKey is required",
        },
        {status: 400}
      )
    };

    /*
     * STEP 1
     * Generate a unique withdrawal reference.
     */

    const reference = `withdraw-${crypto.randomUUID()}`;

    const existingTransaction = await Wallet.findOne({
      user: user.userId,
      idempotencyKey,
    });

    if(existingTransaction){
      return NextResponse.json(
        {
          success: true,
          message: "Withdraw request successiful",
          reference: existingTransaction.reference,
          status:existingTransaction.status,
        }
      )
    }

    /*
     * STEP 2
     * Reserve the user's money and create
     * a pending withdrawal transaction.
     */

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const wallet = await Wallet.findOne({
        user: user.userId,
      }).session(session);

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < numericAmount) {
        throw new Error("Insufficient balance");
      }

      // Reserve/deduct the withdrawal amount
      wallet.balance -= numericAmount;

      await wallet.save({ session });

      // Create pending withdrawal transaction
      await Transaction.create(
        [
          {
            user: user.userId,
            type: "debit",
            category: "withdrawal",
            amount: numericAmount,
            description: `Withdrawal to ${bankName} - ****${accountNumber.slice(-4)}`,
            status: "pending",
            reference,
            idempotencyKey,
          },
        ],
        {
          session,
          ordered: true,
        }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      // Another request may have created this withdrawal
      // with the same idempotency key.
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === 11000
      ) {
        const existingTransaction = await Transaction.findOne({
          user: user.userId,
          idempotencyKey,
        });

        if (existingTransaction) {
          return NextResponse.json({
            success: true,
            message: "Withdrawal request already processed",
            reference: existingTransaction.reference,
            status: existingTransaction.status,
          });
        }
      }

      console.error("Withdrawal reservation error:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to reserve withdrawal",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 3
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
          name: accountName || "Finova User",
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

      return await refundWithdrawal(
        user.userId,
        reference,
        numericAmount,
        recipientData.message ||
        "Failed to create transfer recipient"
      );
    }

    const recipientCode = recipientData.data.recipient_code;

    /*
     * STEP 4
     * Initiate Paystack transfer.
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

      return await refundWithdrawal(
        user.userId,
        reference,
        numericAmount,
        transferData.message ||
        "Failed to initiate withdrawal"
      );
    }

    /*
     * Paystack accepted the transfer.
     *
     * Our wallet has already been reserved,
     * so we do NOT deduct it again.
     */

    return NextResponse.json({
      success: true,
      message: "Withdrawal initiated successfully",
      reference,
      status: transferData.data.status,
    });
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

/*
 * Refund a withdrawal when Paystack immediately
 * rejects the recipient or transfer.
 */
async function refundWithdrawal(
  userId: string,
  reference: string,
  amount: number,
  reason: string
) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const wallet = await Wallet.findOne({
      user: userId,
    }).session(session);

    if (!wallet) {
      throw new Error("Wallet not found during refund");
    }

    wallet.balance += amount;

    await wallet.save({ session });

    const transaction = await Transaction.findOne({
      user: userId,
      reference,
    }).session(session);

    if (transaction) {
      transaction.status = "failed";
      await transaction.save({
        session,
      });
    }

    await session.commitTransaction();

    return NextResponse.json(
      {
        success: false,
        message: reason,
        reference,
      },
      { status: 400 }
    );
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Withdrawal refund error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Withdrawal failed and refund requires reconciliation",
        reference,
      },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}