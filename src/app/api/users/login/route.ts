import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export  async function POST(request: NextRequest){
    try {
        await connect();

        const reqBody = await request.json();
        const {email, password} = reqBody

        const user = await User.findOne({email})

        if(!user){
            return NextResponse.json(
                {
                    success: true,
                    message: "Invalid email or password",
                },
                {status: 400}
            )
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if(!isPasswordValid){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password or email",
                },
                {status: 400}
            )
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d"
            }
        )

        const response =  NextResponse.json(
            {
                success: true,
                message: "Login successiful"
            },
        )

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        })

        return response;

    } catch (error) {
        console.error(error);
        
        return NextResponse.json(
            {
                success: false,
                message: "Login request failed"
            },
            {status: 500}
        )
    }
}