// app/api/profiles/me/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

async function validateSession(request, requestId) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    console.error(
      JSON.stringify(
        {
          message: `Unauthorized: No valid session or missing user ID`,
          requestId,
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
  return session;
}

export async function GET(request) {
  const requestId = Date.now().toString();
  try {
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    await db();
    const profile = await Profile.findOne({ userId: session.user.id }).lean();
    if (!profile) {
      console.error(
        JSON.stringify(
          {
            message: `Profile not found for user: ${session.user.id}`,
            requestId,
          },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error(
      JSON.stringify(
        { message: "Profile GET error", requestId, error: error.message },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to fetch profile: ${error.message}` },
      { status: 500 }
    );
  }
}
