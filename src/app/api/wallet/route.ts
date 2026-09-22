import { connect } from "@/dbConfig/dbConfig";
import Wallet from "@/models/walletModel";
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
                {status: 401}
            )
        }

        const wallet = await Wallet.findOne({
            user: user.userId
        })

        if(!wallet){
            return NextResponse.json(
                {
                    success: false,
                    message: "Wallet not found"
                },
                {status: 404}
            )
        }

        return NextResponse.json({
            success: true,
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
                currency: wallet.currency,
            }
        })
    } catch (error) {
        console.error("Wallet API error", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch",
            },
            {status: 500}
        )
    }
}