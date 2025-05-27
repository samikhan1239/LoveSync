import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Invitation } from "@/models/Invitation";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.log(
        JSON.stringify({ message: "PATCH: Unauthorized", requestId }, null, 2)
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db();
    const { status } = await request.json();
    if (!["accepted", "declined"].includes(status)) {
      console.log(
        JSON.stringify(
          { message: "PATCH: Invalid status", requestId, status },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const invitation = await Invitation.findById(params.id);
    if (!invitation) {
      console.log(
        JSON.stringify(
          { message: "PATCH: Invitation not found", requestId, id: params.id },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitation.receiverId.toString() !== session.user.id) {
      console.log(
        JSON.stringify(
          {
            message: "PATCH: Unauthorized - Not receiver",
            requestId,
            receiverId: invitation.receiverId.toString(),
            userId: session.user.id,
          },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    invitation.status = status;
    invitation.updatedAt = new Date();
    await invitation.save();

    let mutual = false;
    if (status === "accepted") {
      const reverseInvitation = await Invitation.findOne({
        senderId: invitation.receiverId,
        receiverId: invitation.senderId,
        status: "pending",
      });

      if (reverseInvitation) {
        reverseInvitation.status = "mutual";
        reverseInvitation.updatedAt = new Date();
        invitation.status = "mutual";
        await Promise.all([reverseInvitation.save(), invitation.save()]);
        mutual = true;
        console.log(
          JSON.stringify(
            {
              message: "PATCH: Mutual invitation detected and updated",
              requestId,
              invitationId: invitation._id.toString(),
              reverseInvitationId: reverseInvitation._id.toString(),
            },
            null,
            2
          )
        );
      }
    }

    // Fetch profiles
    const senderProfile = await Profile.findOne({
      userId: invitation.senderId,
    })
      .select(
        "name age location occupation education.degree phone verified premium photos"
      )
      .lean();
    const receiverProfile = await Profile.findOne({
      userId: invitation.receiverId,
    })
      .select(
        "name age location occupation education.degree phone verified premium photos"
      )
      .lean();

    const response = {
      ...invitation.toObject(),
      _id: invitation._id.toString(),
      senderId: invitation.senderId.toString(),
      receiverId: invitation.receiverId.toString(),
      senderProfile: senderProfile
        ? {
            ...senderProfile,
            _id: senderProfile._id.toString(),
            userId: senderProfile.userId.toString(),
          }
        : null,
      receiverProfile: receiverProfile
        ? {
            ...receiverProfile,
            _id: receiverProfile._id.toString(),
            userId: receiverProfile.userId.toString(),
          }
        : null,
      senderPhone:
        invitation.status === "accepted" || invitation.status === "mutual"
          ? senderProfile?.phone || null
          : null,
      receiverPhone:
        invitation.status === "accepted" || invitation.status === "mutual"
          ? receiverProfile?.phone || null
          : null,
    };

    console.log(
      JSON.stringify(
        {
          message: `Invitation ${status}${mutual ? " (mutual)" : ""}`,
          requestId,
          invitationId: invitation._id.toString(),
        },
        null,
        2
      )
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      JSON.stringify(
        { message: "Invitation PATCH error", requestId, error: error.message },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to update invitation: ${error.message}` },
      { status: 500 }
    );
  }
}
