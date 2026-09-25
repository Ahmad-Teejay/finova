import { connect } from "@/dbConfig/dbConfig";
import { getCurrentUser } from "@/helpers/auth";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest){
   try {
    await connect();

    const user = await getCurrentUser();

    if(!user){
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            {status: 401}
        )
    }

    const reqBody = await request.json();
    const { recipient, amount } = reqBody;
    const numericAmount = Number(amount);

    if(!recipient){
        return NextResponse.json(
            {
                success: false,
                message: "Recipient is required",
            },
            {status: 400}
        )
    };

    if(!numericAmount || numericAmount <= 0){
        return NextResponse.json(
            {
                success: false,
                message: "Invalid amount"
            },
            {status: 500},
        )
    };

    const recipientUser = await User.findOne({
        $or: [
            {email: recipient},
            {username: recipient},
        ],
    });
    
    if(!recipientUser){
        return NextResponse.json(
            {
                success: false,
                message: "Recipient not found",
            },
            {status: 404}
        )
    };

    if(recipientUser._id.toString() === user.id){
        return NextResponse.json(
            {
                success: false,
                nessage: "You cannot send yourself money",
            },
            {status: 400}
        )
    };

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

    if (senderWallet.balance < numericAmount) {
        throw new Error("Insufficient wallet balance");
    }

    senderWallet.balance -= numericAmount;
    recipientWallet.balance += numericAmount;

    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    const senderReference = `TRANSFER-${crypto.randomUUID()}`;
    const recipientReference = `TRANSFER-${crypto.randomUUID()}`;

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
            description: `Money received from ${user.email}`,
            status: "success",
            reference: recipientReference,
        },
        ],
        { session, ordered: true }
    );

    await session.commitTransaction();

    return NextResponse.json({
        success: true,
        message: "Money sent successfully",
    });
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
    console.error("Tarnsfer error", error);

    return NextResponse.json(
        {
            success: false,
            message: "Transfer failed",
        },
        {status: 500},
    )
   }
}