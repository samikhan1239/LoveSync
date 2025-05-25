import { NextResponse } from "next/server";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.error(
        JSON.stringify(
          { message: "POST /api/profiles/approve: Unauthorized", requestId },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Restrict to admins
    if (session.user.role !== "admin") {
      console.error(
        JSON.stringify(
          {
            message: "POST /api/profiles/approve: Admin access required",
            requestId,
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

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    const { profileId } = await request.json();
    if (!profileId) {
      console.error(
        JSON.stringify({ message: "Missing profileId", requestId }, null, 2)
      );
      return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
    }

    const profile = await Profile.findByIdAndUpdate(
      profileId,
      { status: "approved", updatedAt: new Date() },
      { new: true, select: "name age city status userId" }
    ).lean();

    if (!profile) {
      console.error(
        JSON.stringify(
          { message: "Profile not found", requestId, profileId },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log(
      JSON.stringify(
        { message: "Profile approved", requestId, profileId: profile._id },
        null,
        2
      )
    );
    return NextResponse.json(profile);
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Profiles approve POST error",
          requestId,
          error: error.message,
          stack: error.stack,
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
