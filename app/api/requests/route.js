import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import { Invitation } from "@/models/Invitation";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.error(
        JSON.stringify(
          {
            message: "Unauthorized: No valid session or missing user ID",
            requestId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Session validated",
          requestId,
          userId: session.user.id,
          role: session.user.role,
        },
        null,
        2
      )
    );

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    // Fetch sent invitations
    const invitations = await Invitation.find({
      senderId: session.user.id,
    }).lean();

    // Map receiverId to targetProfileId
    const profileIds = invitations.map((inv) => inv.receiverId);
    const profiles = await Profile.find({
      userId: { $in: profileIds },
      status: "approved",
    }).select("_id userId");

    const profileMap = new Map(
      profiles.map((p) => [p.userId.toString(), p._id.toString()])
    );

    const enrichedInvitations = invitations.map((inv) => ({
      ...inv,
      targetProfileId: profileMap.get(inv.receiverId.toString()) || null,
    }));

    console.log(
      JSON.stringify(
        {
          message: "Invitations fetched",
          requestId,
          count: enrichedInvitations.length,
          invitations: enrichedInvitations,
        },
        null,
        2
      )
    );

    return NextResponse.json({ invitations: enrichedInvitations });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Requests GET error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to fetch invitations: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.error(
        JSON.stringify(
          {
            message: "Unauthorized: No valid session or missing user ID",
            requestId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Session validated",
          requestId,
          userId: session.user.id,
          role: session.user.role,
        },
        null,
        2
      )
    );

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    const { targetProfileId, message } = await request.json();
    console.log(
      JSON.stringify(
        {
          message: "Request data received",
          requestId,
          targetProfileId,
          message,
        },
        null,
        2
      )
    );

    if (!targetProfileId) {
      console.error(
        JSON.stringify(
          { message: "Missing targetProfileId", requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Missing target profile ID" },
        { status: 400 }
      );
    }

    const targetProfile = await Profile.findOne({
      _id: targetProfileId,
      status: "approved",
    }).select("userId");
    if (!targetProfile) {
      console.error(
        JSON.stringify(
          {
            message: "Target profile not found or not approved",
            requestId,
            targetProfileId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Target profile not found or not approved" },
        { status: 404 }
      );
    }

    const receiverId = targetProfile.userId;
    if (!receiverId) {
      console.error(
        JSON.stringify(
          {
            message: "Target profile has no associated user",
            requestId,
            targetProfileId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Target profile has no associated user" },
        { status: 400 }
      );
    }

    if (receiverId.toString() === session.user.id) {
      console.error(
        JSON.stringify(
          { message: "Cannot send invitation to self", requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Cannot send an invitation to yourself" },
        { status: 400 }
      );
    }

    const existingInvitation = await Invitation.findOne({
      $or: [
        {
          senderId: session.user.id,
          receiverId,
          status: { $in: ["pending", "accepted", "mutual"] },
        },
        {
          senderId: receiverId,
          receiverId: session.user.id,
          status: { $in: ["pending", "accepted", "mutual"] },
        },
      ],
    });
    if (existingInvitation) {
      console.error(
        JSON.stringify(
          {
            message: "Invitation already exists",
            requestId,
            targetProfileId,
            invitationStatus: existingInvitation.status,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        {
          error: `An invitation with status '${existingInvitation.status}' already exists`,
        },
        { status: 400 }
      );
    }

    const newInvitation = await Invitation.create({
      senderId: session.user.id,
      receiverId,
      message: message || "",
      status: "pending",
    });

    console.log(
      JSON.stringify(
        {
          message: "Invitation created",
          requestId,
          invitationId: newInvitation._id,
          targetProfileId,
          receiverId,
        },
        null,
        2
      )
    );

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation: newInvitation,
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Requests POST error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to send invitation: ${error.message}` },
      { status: 500 }
    );
  }
}
