import { connect } from "@/dbConfig/dbConfig";
import Transaction from "@/models/transactionModel";
import { getCurrentUser } from "@/helpers/auth";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        await connect();

        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {status: 404}
            )
        }

        const transactions = await Transaction.find({
            user: user.userId,
        })
        .sort({createdAt: -1 })
        .limit(10);

        return NextResponse.json(
            {
                success: true,
                transactions,
            }
        )
    } catch (error) {
        console.error("Transaction API error", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fecth transaction",
            },
            {status: 500}
        )
    }
}