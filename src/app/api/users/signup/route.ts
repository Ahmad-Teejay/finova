import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
   try {
    await connect();

    const reqBody = await request.json();
    const {username, email, password} = reqBody;

    const existingUser = await User.findOne({
        $or: [{email}, {username}]
    });

    if(existingUser){
        return NextResponse.json(
            {
                success: false,
                message: "username or email already exits",
            },
            {status: 400}
        )
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    const newWallet = await Wallet.create({
        user: newUser._id,
        balance: 0,
        currency: "NGN",
    });

    return NextResponse.json(
        {
            success: true,
            message: "User registered successfully",
        
         user: {
            user: newUser._id,
            username: newUser.username,
            email: newUser.email,
         },
         wallet: {
            id: newWallet._id,
            balance: newWallet.balance,
            currency: newWallet.currency,
         },
        },
        {status: 201}
    )

   } catch (error) {
    console.error(error);
    
    return NextResponse.json(
        {
            success: false,
            message: "Signup request failed"
        },
        {status: 500}
    )
   }
}