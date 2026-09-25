import { getCurrentUser } from "@/helpers/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(requuest: NextRequest){
 try {
    const user = await getCurrentUser();

    if(!user){
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            {status: 500}
        )
    };

    const reqBody = await requuest.json();
    const { name, accountNumber, BankCode } = reqBody;

    if(!name){
        return NextResponse.json(
            {
                success: false,
                message: "Name is required"
            },
            {status: 400}
        )
    };

    if(!accountNumber){
        return NextResponse.json(
            {
                success: false,
                message: "accountNumber is required"
            },
            {status: 400}
        )
    };

    if(!BankCode){
        return NextResponse.json(
            {
                success: false,
                message: "Bank code is required"
            },
            {status: 400}
        )
    };

    const response = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name,
          account_number: accountNumber,
          bank_code: BankCode,
          currency: "NGN",
        }),
      }
    );

    const data = await response.json();

    if(!response.ok || data.status){
        return NextResponse.json(
            {
                success: false,
                message: data.message || "Failed to create to transfer"
            },
            {status: 400}
        )
    };

    return NextResponse.json(
        {
            success: true,
            message: "Transfer created successifully",
            recipientcode: data.data.recipient_code,
        },
    
    )

 } catch (error) {
    console.error("Create recipient error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create transfer recipient",
      },
      { status: 500 }
    );
 }
}