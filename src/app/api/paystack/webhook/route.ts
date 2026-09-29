import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transactionModel";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import  Wallet  from "@/models/userModel";

export async function POST(request: NextRequest){
    try {
         const body = await request.text();

         const signature =  request.headers.get("x-paystack-signature");

         if(!signature){
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing paystack signature",
                },
                {status : 401},
            )
         };

         await connect();

         const secret = process.env.PAYSTACK_SECRET_KEY;

         if(!secret){
            console.error("PAYSTACK_SECRET_KEY is not configure");

            return NextResponse.json(
                {
                    success: false,
                    message: "Server configure error",
                },
                {status: 500},
            )
         };

         const hash =  crypto
         .createHmac("sha512", secret)
         .update(body)
         .digest("hex");

         if(hash !== signature){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid paystack signature",
                },
                {status: 401},
            )
         };

         const event = JSON.parse(body);
         console.log("Paystack webhook received:", event.event);

         if (event.event === "transfer.success") {
            const reference = event.data.reference;

            const transaction = await Transaction.findOne({
                reference,
                category: "withdrawal",
            });

            if (!transaction) {
                console.error(
                "Withdrawal transaction not found:",
                reference
                );

                return NextResponse.json({
                success: true,
                });
            }

            if (transaction.status === "success") {
                return NextResponse.json({
                success: true,
                message: "Transaction already processed",
                });
            }

            transaction.status = "success";

            await transaction.save();

            console.log(
                "Withdrawal marked as successful:",
                reference
            );
            };

            if (event.event === "transfer.failed") {
            const reference = event.data.reference;

            const session = await mongoose.startSession();

            try {
                session.startTransaction();

                const transaction = await Transaction.findOne({
                reference,
                category: "withdrawal",
                }).session(session);

                if (!transaction) {
                console.error(
                    "Withdrawal transaction not found:",
                    reference
                );

                await session.abortTransaction();

                return NextResponse.json({
                    success: true,
                });
                };

                if (transaction.walletRefunded) {
                    await session.abortTransaction();

                    return NextResponse.json({
                        success: true,
                        message: "Withdrawal already refunded",
                    });
                }
                // Prevent processing the same failure twice
                if (transaction.status === "failed") {
                await session.abortTransaction();

                return NextResponse.json({
                    success: true,
                    message: "Transaction already processed",
                });
                }

                const wallet = await Wallet.findOne({
                user: transaction.user,
                }).session(session);

                if (!wallet) {
                throw new Error("Wallet not found");
                }

                // Return the withdrawn amount to the wallet
                wallet.balance += transaction.amount;

                await wallet.save({ session });

                // Mark the withdrawal as failed
                transaction.status = "failed";
                transaction.walletRefunded = true;

                await transaction.save({
                session,
                });

                await session.commitTransaction();

                console.log(
                "Withdrawal failed and wallet refunded:",
                reference
                );

                return NextResponse.json({
                success: true,
                message: "Withdrawal marked as failed and wallet refunded",
                });
            } catch (error) {
                await session.abortTransaction();

                console.error(
                "Failed withdrawal webhook error:",
                error
                );

                return NextResponse.json(
                {
                    success: false,
                    message: "Failed to process withdrawal failure",
                },
                { status: 500 }
                );
            } finally {
                session.endSession();
            }
            }

            if (event.event === "transfer.reversed") {
                const reference = event.data.reference;

                const session = await mongoose.startSession();

                try {
                    session.startTransaction();

                    const transaction = await Transaction.findOne({
                    reference,
                    category: "withdrawal",
                    }).session(session);

                    if (!transaction) {
                    console.error("Withdrawal transaction not found:", reference);

                    await session.abortTransaction();

                    return NextResponse.json({ success: true });
                    }

                    // Prevent duplicate refunds
                    if (transaction.walletRefunded) {
                    await session.abortTransaction();

                    return NextResponse.json({
                        success: true,
                        message: "Withdrawal already refunded",
                    });
                    }

                    const wallet = await Wallet.findOne({
                    user: transaction.user,
                    }).session(session);

                    if (!wallet) {
                    throw new Error("Wallet not found");
                    }

                    // Return the withdrawn amount to the wallet
                    wallet.balance += transaction.amount;

                    await wallet.save({ session });

                    // Mark transaction as reversed
                    transaction.status = "reversed";
                    transaction.walletRefunded = true;

                    await transaction.save({ session });

                    await session.commitTransaction();

                    console.log("Withdrawal reversed and wallet refunded:", reference);

                    return NextResponse.json({
                    success: true,
                    message: "Withdrawal marked as reversed and wallet refunded",
                    });
                } catch (error) {
                    await session.abortTransaction();

                    console.error("Reversed withdrawal webhook error:", error);

                    return NextResponse.json(
                    {
                        success: false,
                        message: "Failed to process withdrawal reversal",
                    },
                    { status: 500 }
                    );
                } finally {
                    session.endSession();
                }
                }
         return NextResponse.json({
            success: true,
         });

    } catch (error) {
        console.error("Paystack webhook error:", error);

        return NextResponse.json(
        {
            success: false,
            message: "Webhook processing failed",
        },
        { status: 500 }
        );
    }
}