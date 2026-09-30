import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getCurrentUser } from "@/helpers/auth";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {

        const currentUser = await getCurrentUser();

        if(!currentUser){
            return NextResponse.json(
                { success: false, message: "Unauthorized"},
                {status: 401}
            )
        };

        const { pin, confirmPin} = await request.json();

        if(!pin || !confirmPin){
            return NextResponse.json(
                { success: false, message: "Pin and confirmation Pin are required"},
                {status: 400}
            )
        };

        if(!/^\d{4}$/.test(pin)){
            return NextResponse.json(
                {success: false, message: "Pin must be exactly 4 digits"},
                {status: 400}
            )
        };

        if(pin != confirmPin){
            return NextResponse.json(
                {sucess: false, message: "Pin doesn't match"},
                {status: 400}
            )
        };

        await connect();

        const user = await User.findById(currentUser.userId);

        if(!user){
            return NextResponse.json(
                {success: false, message: "User not found"},
                {status: 404},
            )
        };

        if(user.transactionPinHash){
            return NextResponse.json(
                {success: false, message: "Transaction Pin already exists"},
                {status: 400},
            )
        };

        const salt = await bcryptjs.genSalt(10);
        const transactionPinHash = await bcryptjs.hash(pin, salt);

        user.transactionPinHash = transactionPinHash;

        await user.save();

        return NextResponse.json(
            {success: true, message: "Transaction PIN created successifull"},
            {status: 201}
        )

    } catch (error) {
        console.error("PIN crete error", error);

        return NextResponse.json(
            {success: false, message: "Failed to create transaction PIN"},
            {status: 500}
        )
    }
}
