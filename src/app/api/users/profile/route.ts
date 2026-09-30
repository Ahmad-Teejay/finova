import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getCurrentUser } from "@/helpers/auth";

export async function GET(){
    try {
        const currentUser = await getCurrentUser();

        if(!currentUser){
            return NextResponse.json(
                { success: false, message: "Unauthorized"},
                {status: 401}
            )
        };

        await connect();

        const user = await User.findById(currentUser.userId).select("-password");

        if(!user){
            return NextResponse.json(
                {success: false, message: "User not found"},
                {status: 404}
            )
        };

        return NextResponse.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("profile API error", error);

        return NextResponse.json(
            {success: false, message: "Failed to fetch profile"},
            {status: 500}
        )
    }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const username = body.username?.trim();

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Username must be at least 3 characters",
        },
        { status: 400 }
      );
    }

    await connect();

    // Check if another user already has this username
    const existingUser = await User.findOne({
      username,
      _id: { $ne: currentUser.userId },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 409 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      { username },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}