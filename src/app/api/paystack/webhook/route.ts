import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

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