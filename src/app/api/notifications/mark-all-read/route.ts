import { connect } from "@/dbConfig/dbConfig";
import Notification from "@/models/notificationModel";
import { getCurrentUser } from "@/helpers/auth";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connect();

    await Notification.updateMany(
      {
        user: user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark all notifications as read",
      },
      { status: 500 }
    );
  }
}