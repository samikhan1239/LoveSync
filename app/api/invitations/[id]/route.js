import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Invitation } from "@/models/Invitation";
import { Profile } from "@/models/Profile";
import connectDB from "@/lib/db";

export async function PATCH(request, { params }) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { status } = await request.json();
  const invitation = await Invitation.findById(params.id);
  if (!invitation)
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );

  if (invitation.receiverId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  invitation.status = status;
  await invitation.save();

  if (status === "accepted") {
    const reverseInvitation = await Invitation.findOne({
      senderId: invitation.receiverId,
      receiverId: invitation.senderId,
      status: "accepted",
    });

    if (reverseInvitation) {
      const senderProfile = await Profile.findOne({
        userId: invitation.senderId,
      });
      const receiverProfile = await Profile.findOne({
        userId: invitation.receiverId,
      });
      console.log(
        `Mutual acceptance between ${senderProfile.email} and ${receiverProfile.email}`
      );
    }
  }

  return NextResponse.json(invitation);
}
