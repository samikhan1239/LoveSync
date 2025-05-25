import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Invitation } from "@/models/Invitation";
import connectDB from "@/lib/db";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const invitations = await Invitation.find({ status: "accepted" }).populate(
    "senderId receiverId",
    "email"
  );
  return NextResponse.json(invitations);
}
