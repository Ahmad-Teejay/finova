import { connect } from "@/dbConfig/dbConfig";
import Notification from "@/models/notificationModel";
import { getCurrentUser } from "@/helpers/auth";
import { NextResponse } from "next/server";

export async function GET(){
    try {
        const user = await getCurrentUser();

        if(!user){
            return NextResponse.json(
                {success: false, message: "Unauthorized"},
                {status: 401},
            )
        };

        await connect();

        const notifications = await Notification.find({
            user: user.userId,
        })
        .sort({ createdAt: -1 })
        .limit(20);

    const unreadCount = await Notification.countDocuments({
        user: user.userId,
        isRead: false,
    });

    return NextResponse.json(
        {
            success: true,
            notifications,
            unreadCount,
        },
        {status: 200}
    )
    } catch (error) {
        console.error("Notifications API error:", error);

        return NextResponse.json(
        {
            success: false,
            message: "Failed to fetch notifications",
        },
        { status: 500 }
        );
    }
}