import { getCurrentUser } from "@/helpers/auth";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import  Notification  from "@/models/notificationModel";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: user.userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Notification marked as read",
        notification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notification as read",
      },
      { status: 500 }
    );
  }
}