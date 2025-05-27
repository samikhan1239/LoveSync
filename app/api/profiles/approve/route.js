import { NextResponse } from "next/server";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { z } from "zod";

// Validation schema
const approveSchema = z.object({
  profileId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid profile ID"),
});

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Unauthorized",
            requestId,
            adminId: null,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Unauthorized: No valid session or missing user ID" },
        { status: 401 }
      );
    }

    // Restrict to admins
    if (session.user.role !== "admin") {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Admin access required",
            requestId,
            adminId: session.user.id,
            role: session.user.role,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Connect to database
    await db();
    console.log(
      JSON.stringify(
        {
          message: "Database connected",
          requestId,
          adminId: session.user.id,
        },
        null,
        2
      )
    );

    // Validate request body
    const parsedBody = approveSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Invalid request body",
            requestId,
            adminId: session.user.id,
            errors: parsedBody.error.errors,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid request body", details: parsedBody.error.errors },
        { status: 400 }
      );
    }

    const { profileId } = parsedBody.data;

    // Validate profileId as ObjectId
    let profileObjectId;
    try {
      profileObjectId = new mongoose.Types.ObjectId(profileId);
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Invalid profileId",
            requestId,
            adminId: session.user.id,
            profileId,
            error: error.message,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      );
    }

    // Check if profile exists and is not already approved
    const existingProfile = await Profile.findById(profileObjectId).lean();
    if (!existingProfile) {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Profile not found",
            requestId,
            profileId,
            adminId: session.user.id,
          },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (existingProfile.status === "approved") {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Profile already approved",
            requestId,
            profileId,
            adminId: session.user.id,
            userId: existingProfile.userId.toString(),
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Profile is already approved" },
        { status: 400 }
      );
    }

    // Update profile status
    const profile = await Profile.findByIdAndUpdate(
      profileObjectId,
      {
        status: "approved",
        statusUpdatedBy: session.user.id,
        statusUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        new: true,
        select:
          "name age location occupation education.degree phone verified premium photos status userId",
      }
    ).lean();

    if (!profile) {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Failed to update profile",
            requestId,
            profileId,
            adminId: session.user.id,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Failed to approve profile" },
        { status: 500 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Profile approved",
          requestId,
          profileId: profile._id.toString(),
          userId: profile.userId.toString(),
          adminId: session.user.id,
        },
        null,
        2
      )
    );

    return NextResponse.json({
      ...profile,
      _id: profile._id.toString(),
      userId: profile.userId.toString(),
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "POST /api/profiles/approve: Server error",
          requestId,
          adminId: session.user?.id || null,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to approve profile: ${error.message}` },
      { status: 500 }
    );
  }
}
