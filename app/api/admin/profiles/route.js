import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import connectDB from "@/lib/db";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const profiles = await Profile.find({}).populate("userId", "email");
  return NextResponse.json(profiles);
}

export async function PATCH(request) {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const { profileId, status } = await request.json();
  const profile = await Profile.findByIdAndUpdate(
    profileId,
    { status },
    { new: true }
  );
  return NextResponse.json(profile);
}
