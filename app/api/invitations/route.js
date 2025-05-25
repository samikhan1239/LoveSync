import { NextResponse } from "next/server";
import { Invitation } from "@/models/Invitation";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.log(
        JSON.stringify({ message: "POST: Unauthorized", requestId }, null, 2)
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db();
    const { targetUserId, message } = await request.json();
    if (!targetUserId || targetUserId === session.user.id) {
      console.log(
        JSON.stringify(
          { message: "POST: Invalid target user ID", requestId, targetUserId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid target user ID" },
        { status: 400 }
      );
    }

    const receiverProfile = await Profile.findOne({ userId: targetUserId });
    if (!receiverProfile) {
      console.log(
        JSON.stringify(
          {
            message: "POST: Receiver profile not found",
            requestId,
            targetUserId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Receiver profile not found" },
        { status: 404 }
      );
    }

    const existingInvitation = await Invitation.findOne({
      senderId: session.user.id,
      receiverId: targetUserId,
      status: "pending",
    });
    if (existingInvitation) {
      console.log(
        JSON.stringify(
          {
            message: "POST: Invitation already exists",
            requestId,
            existingInvitation,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    const invitation = await Invitation.create({
      senderId: session.user.id,
      receiverId: targetUserId,
      message,
      status: "pending",
      createdAt: new Date(),
    });

    // Check for mutual invitation
    const mutual = await Invitation.findOne({
      senderId: targetUserId,
      receiverId: session.user.id,
      status: "pending",
    });
    if (mutual) {
      await Invitation.updateMany(
        { _id: { $in: [invitation._id, mutual._id] } },
        { status: "mutual", updatedAt: new Date() }
      );
      console.log(
        JSON.stringify(
          {
            message: "POST: Mutual invitation detected and updated",
            requestId,
            invitationId: invitation._id,
            mutualId: mutual._id,
          },
          null,
          2
        )
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Invitation created",
          requestId,
          invitation: invitation.toObject(),
        },
        null,
        2
      )
    );
    return NextResponse.json(invitation);
  } catch (error) {
    console.error(
      JSON.stringify(
        { message: "Invitation POST error", requestId, error: error.message },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to create invitation: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.log(
        JSON.stringify({ message: "GET: Unauthorized", requestId }, null, 2)
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db();
    let invitations;
    let counts;

    if (session.user.role === "admin") {
      // Admin: Fetch all invitations
      invitations = await Invitation.find()
        .populate("senderId", "email")
        .populate("receiverId", "email");
      counts = {
        total: await Invitation.countDocuments(),
        pending: await Invitation.countDocuments({ status: "pending" }),
        accepted: await Invitation.countDocuments({ status: "accepted" }),
        declined: await Invitation.countDocuments({ status: "declined" }),
        mutual: await Invitation.countDocuments({ status: "mutual" }),
      };
    } else {
      // Regular user: Fetch invitations sent or received by the user
      invitations = await Invitation.find({
        $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      })
        .populate("senderId", "email")
        .populate("receiverId", "email");
      counts = {
        total: invitations.length,
        pending: invitations.filter((inv) => inv.status === "pending").length,
        accepted: invitations.filter((inv) => inv.status === "accepted").length,
        declined: invitations.filter((inv) => inv.status === "declined").length,
        mutual: invitations.filter((inv) => inv.status === "mutual").length,
      };
    }

    console.log(
      JSON.stringify(
        {
          message: "Invitations fetched",
          requestId,
          count: invitations.length,
          counts,
          role: session.user.role,
        },
        null,
        2
      )
    );
    return NextResponse.json({ invitations, counts });
  } catch (error) {
    console.error(
      JSON.stringify(
        { message: "Invitations GET error", requestId, error: error.message },
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

export async function PUT(request) {
  const requestId = Date.now().toString();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      console.log(
        JSON.stringify({ message: "PUT: Unauthorized", requestId }, null, 2)
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db();
    const { invitationId, status } = await request.json();
    if (
      !["pending", "accepted", "rejected", "mutual", "declined"].includes(
        status
      )
    ) {
      console.log(
        JSON.stringify(
          { message: "PUT: Invalid status", requestId, status },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const invitation = await Invitation.findByIdAndUpdate(
      invitationId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!invitation) {
      console.log(
        JSON.stringify(
          { message: "PUT: Invitation not found", requestId, invitationId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Invitation updated",
          requestId,
          invitation: invitation.toObject(),
        },
        null,
        2
      )
    );
    return NextResponse.json(invitation);
  } catch (error) {
    console.error(
      JSON.stringify(
        { message: "Invitation PUT error", requestId, error: error.message },
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
