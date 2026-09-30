import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Wallet from "@/models/walletModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

function generateAccountNumber(){
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function generateUniqueAccountNumber(){
    let accountNumber = generateAccountNumber();

    while (await User.exists({accountNumber})) {
        accountNumber = generateAccountNumber();
    }

    return accountNumber;
}

export async function POST(request: NextRequest){
   try {
    await connect();

    const reqBody = await request.json();
    const {fullName, username, email, phone, password} = reqBody;

    if (!fullName || !username || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "FullName, username, email, phone and password are required",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
        $or: [{fullName}, {username}, {email}, {phone}]
    });

    if(existingUser){
        return NextResponse.json(
            {
                success: false,
                message: "FullName, username, email or phone number already exits",
            },
            {status: 400}
        )
    }

    const accountNumber = await generateUniqueAccountNumber();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({
        fullName,
        username,
        email,
        phone,
        accountNumber,
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
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            phone: newUser.phone,
            accountNumber: newUser.accountNumber,
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