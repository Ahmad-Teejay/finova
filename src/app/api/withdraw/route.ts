import { connect } from "@/dbConfig/dbConfig";
import { getCurrentUser } from "@/helpers/auth";
import Wallet from "@/models/walletModel";
import Transaction from "@/models/transactionModel";
import mongoose from "mongoose";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

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
        };

        const reqBody = await request.json()
        const {bankName, accountNumber, amount, bankCode} = reqBody;
        const numericAmount = Number(amount);

        if(!bankName){
            return NextResponse.json(
                {
                    success: false,
                    message: "Bank name is required"
                },
                {status: 400}
            )
        };

        if(!accountNumber){
            return NextResponse.json(
                {
                    success: false,
                    message: "Account number is required"
                },
                {status: 400}
            )
        };

        if(!bankCode){
            return NextResponse.json(
                {
                    success: false,
                    message: "Bank code is required",
                },
                {status: 400},
            )
        }

        if(!numericAmount || numericAmount <= 0){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid amount",
                },
                {status: 400}
            )
        };

        if(numericAmount < 100){
            return NextResponse.json(
                {
                    success: false,
                    message:  "Minimum withdrawal amount is ₦100",
                },
                {status: 400}
            )
        };

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const wallet = await Wallet.findOne({
                user: user.userId,
            }).session(session);

            if(!wallet){
                throw new Error("Wallet not found");
                
            }

            if(wallet.balance < numericAmount){
                throw new Error("Insufficient balance");
                
            };

            wallet.balance -= numericAmount;
            await wallet.save({session});

            const reference = `WITHDRAW-${crypto.randomUUID()}`;

                await Transaction.create(
                    [
                    {
                        user: user.userId,
                        type: "debit",
                        amount: numericAmount,
                        description: `Withdrawal to ${bankName} - ${accountNumber}`,
                        status: "pending",
                        reference,
                    },
                    ],
                    { session }
                )

            await session.commitTransaction();

            return NextResponse.json(
                {
                    success: true,
                    message: "Withdrawal request created",
                    reference,
                }
            );

        } catch (error) {
            await session.abortTransaction();

            console.error("Withdrawal transaction error", error);

            return NextResponse.json(
                {
                    success: false,
                    message:
                    error instanceof Error ? error.message : "Withdraw failed",
                },
                {status: 400}
            )
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error("Withdrawal API error", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to process withdrawal",
            },
            {status: 500}
        )
    }
}