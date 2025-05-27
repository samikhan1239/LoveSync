import { NextResponse } from "next/server";
import { Invitation } from "@/models/Invitation";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Validation schemas
const postSchema = z.object({
  targetUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  message: z.string().max(500).optional(),
});

const putSchema = z.object({
  invitationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  status: z.enum(["pending", "accepted", "declined", "mutual"]),
});

const patchSchema = z.object({
  invitationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  status: z.enum(["accepted", "declined"]),
});

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
    const parsedBody = postSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      console.log(
        JSON.stringify(
          {
            message: "POST: Invalid request body",
            requestId,
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

    const { targetUserId, message } = parsedBody.data;
    const sanitizedMessage = message
      ? sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} })
      : undefined;
    let senderId;
    try {
      senderId = new mongoose.Types.ObjectId(session.user.id);
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            message: "POST: Invalid senderId",
            requestId,
            error: error.message,
          },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    const receiverId = new mongoose.Types.ObjectId(targetUserId);

    if (targetUserId === session.user.id) {
      console.log(
        JSON.stringify(
          { message: "POST: Cannot invite self", requestId, targetUserId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Cannot send invitation to self" },
        { status: 400 }
      );
    }

    const receiverProfile = await Profile.findOne({ userId: receiverId });
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
      senderId,
      receiverId,
      status: "pending",
    });
    if (existingInvitation) {
      console.log(
        JSON.stringify(
          {
            message: "POST: Invitation already exists",
            requestId,
            existingInvitation: existingInvitation._id.toString(),
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

    let invitation;
    const mongoSession = await mongoose.startSession();
    try {
      mongoSession.startTransaction();
      [invitation] = await Invitation.create(
        [
          {
            senderId,
            receiverId,
            message: sanitizedMessage,
            status: "pending",
            createdAt: new Date(),
          },
        ],
        { session: mongoSession }
      );

      const mutual = await Invitation.findOne({
        senderId: receiverId,
        receiverId: senderId,
        status: "pending",
      }).session(mongoSession);

      if (mutual) {
        await Invitation.updateMany(
          { _id: { $in: [invitation._id, mutual._id] } },
          { status: "mutual", updatedAt: new Date() },
          { session: mongoSession }
        );
        console.log(
          JSON.stringify(
            {
              message: "POST: Mutual invitation detected and updated",
              requestId,
              invitationId: invitation._id.toString(),
              mutualId: mutual._id.toString(),
            },
            null,
            2
          )
        );
      }

      await mongoSession.commitTransaction();
    } catch (error) {
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }

    console.log(
      JSON.stringify(
        {
          message: "Invitation created",
          requestId,
          invitationId: invitation._id.toString(),
        },
        null,
        2
      )
    );
    return NextResponse.json({
      ...invitation.toObject(),
      _id: invitation._id.toString(),
      senderId: invitation.senderId.toString(),
      receiverId: invitation.receiverId.toString(),
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Invitation POST error",
          requestId,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
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
        JSON.stringify(
          { message: "GET: Unauthorized", requestId, session },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db();
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(session.user.id);
    } catch (error) {
      console.error(
        JSON.stringify(
          { message: "GET: Invalid userId", requestId, error: error.message },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const matchCondition =
      session.user.role === "admin"
        ? {}
        : { $or: [{ senderId: userId }, { receiverId: userId }] };

    const invitations = await Invitation.aggregate([
      { $match: matchCondition },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "profiles",
          localField: "senderId",
          foreignField: "userId",
          as: "senderProfile",
        },
      },
      { $unwind: { path: "$senderProfile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "profiles",
          localField: "receiverId",
          foreignField: "userId",
          as: "receiverProfile",
        },
      },
      {
        $unwind: { path: "$receiverProfile", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: { path: "$sender", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: { $toString: "$_id" },
          senderId: { $toString: "$senderId" },
          receiverId: { $toString: "$receiverId" },
          message: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          sender: { email: "$sender.email" },
          receiver: { email: "$receiver.email" },
          senderProfile: {
            _id: { $toString: "$senderProfile._id" },
            userId: { $toString: "$senderProfile.userId" },
            name: 1,
            age: 1,
            location: 1,
            occupation: 1,
            education: { degree: 1 },
            phone: {
              $cond: {
                if: { $in: ["$status", ["accepted", "mutual"]] },
                then: "$senderProfile.phone",
                else: null,
              },
            },
            verified: 1,
            premium: 1,
            photos: 1,
          },
          receiverProfile: {
            _id: { $toString: "$receiverProfile._id" },
            userId: { $toString: "$receiverProfile.userId" },
            name: 1,
            age: 1,
            location: 1,
            occupation: 1,
            education: { degree: 1 },
            phone: {
              $cond: {
                if: { $in: ["$status", ["accepted", "mutual"]] },
                then: "$receiverProfile.phone",
                else: null,
              },
            },
            verified: 1,
            premium: 1,
            photos: 1,
          },
        },
      },
    ]);

    // Log to detect duplicates
    const idCounts = invitations.reduce((acc, inv) => {
      acc[inv._id] = (acc[inv._id] || 0) + 1;
      return acc;
    }, {});
    if (Object.values(idCounts).some((count) => count > 1)) {
      console.error(
        JSON.stringify(
          {
            message: "GET: Duplicate invitation IDs detected",
            requestId,
            duplicates: Object.entries(idCounts).filter(
              ([_, count]) => count > 1
            ),
          },
          null,
          2
        )
      );
    }

    const total = await Invitation.countDocuments(matchCondition);
    const counts = await Invitation.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: {
              status: "$_id",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          pending: {
            $arrayElemAt: [
              "$counts.count",
              { $indexOfArray: ["$counts.status", "pending"] },
            ],
          },
          accepted: {
            $arrayElemAt: [
              "$counts.count",
              { $indexOfArray: ["$counts.status", "accepted"] },
            ],
          },
          declined: {
            $arrayElemAt: [
              "$counts.count",
              { $indexOfArray: ["$counts.status", "declined"] },
            ],
          },
          mutual: {
            $arrayElemAt: [
              "$counts.count",
              { $indexOfArray: ["$counts.status", "mutual"] },
            ],
          },
        },
      },
    ]);

    const responseCounts = {
      total,
      pending: counts[0]?.pending || 0,
      accepted: counts[0]?.accepted || 0,
      declined: counts[0]?.declined || 0,
      mutual: counts[0]?.mutual || 0,
    };

    console.log(
      JSON.stringify(
        {
          message: "Invitations fetched",
          requestId,
          count: invitations.length,
          counts: responseCounts,
          role: session.user.role,
          page,
          limit,
        },
        null,
        2
      )
    );
    return NextResponse.json({
      invitations,
      counts: responseCounts,
      pagination: { page, limit, total },
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Invitations GET error",
          requestId,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
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
    const parsedBody = putSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      console.log(
        JSON.stringify(
          {
            message: "PUT: Invalid request body",
            requestId,
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

    const { invitationId, status } = parsedBody.data;
    let invitation;
    try {
      invitation = await Invitation.findByIdAndUpdate(
        invitationId,
        { status, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            message: "PUT: Invalid invitationId",
            requestId,
            error: error.message,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid invitation ID" },
        { status: 400 }
      );
    }

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
          invitationId: invitation._id.toString(),
        },
        null,
        2
      )
    );
    return NextResponse.json({
      ...invitation.toObject(),
      _id: invitation._id.toString(),
      senderId: invitation.senderId.toString(),
      receiverId: invitation.receiverId.toString(),
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Invitation PUT error",
          requestId,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
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

export async function PATCH(request) {
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
    const parsedBody = patchSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      console.log(
        JSON.stringify(
          {
            message: "PATCH: Invalid request body",
            requestId,
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

    const { invitationId, status } = parsedBody.data;
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(session.user.id);
    } catch (error) {
      console.error(
        JSON.stringify(
          { message: "PATCH: Invalid userId", requestId, error: error.message },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    let invitation;
    try {
      invitation = await Invitation.findOne({
        _id: invitationId,
        receiverId: userId,
        status: "pending",
      });
    } catch (error) {
      console.error(
        JSON.stringify(
          {
            message: "PATCH: Invalid invitationId",
            requestId,
            error: error.message,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid invitation ID" },
        { status: 400 }
      );
    }

    if (!invitation) {
      console.log(
        JSON.stringify(
          {
            message: "PATCH: Invitation not found or not authorized",
            requestId,
            invitationId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        {
          error: "Invitation not found or you are not authorized to update it",
        },
        { status: 404 }
      );
    }

    let mutual = false;
    const mongoSession = await mongoose.startSession();
    try {
      mongoSession.startTransaction();
      invitation.status = status;
      invitation.updatedAt = new Date();

      if (status === "accepted") {
        const reverseInvitation = await Invitation.findOne({
          senderId: invitation.receiverId,
          receiverId: invitation.senderId,
          status: "pending",
        }).session(mongoSession);

        if (reverseInvitation) {
          reverseInvitation.status = "mutual";
          reverseInvitation.updatedAt = new Date();
          invitation.status = "mutual";
          await reverseInvitation.save({ session: mongoSession });
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

      await invitation.save({ session: mongoSession });
      await mongoSession.commitTransaction();
    } catch (error) {
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      mongoSession.endSession();
    }

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
        {
          message: "Invitation PATCH error",
          requestId,
          error: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
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
