import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Utility function for validation and session checks
async function validateRequest({
  params,
  session,
  requireAdmin = false,
  requestId,
}) {
  console.log(`[${requestId}] Validating request`, {
    profileId: params.id,
    requireAdmin,
  });

  if (!params.id) {
    console.error(`[${requestId}] Profile ID missing`);
    return NextResponse.json(
      { error: "Profile ID is required" },
      { status: 400 }
    );
  }

  await db(); // Ensure DB connection

  if (!session) {
    console.error(`[${requestId}] Unauthorized: No session`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (requireAdmin && session.user?.role !== "admin") {
    console.error(`[${requestId}] Unauthorized: Not admin`, {
      user: session.user,
    });
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return { profileId: params.id, userId: session.user?.id };
}

// Helper to validate profile existence
async function findProfile(profileId, requestId) {
  try {
    const profile = await Profile.findById(profileId).populate(
      "userId",
      "email"
    );
    if (!profile) {
      console.error(`[${requestId}] Profile not found: ${profileId}`);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return profile;
  } catch (error) {
    if (error.name === "CastError") {
      console.error(`[${requestId}] Invalid profile ID: ${profileId}`);
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      );
    }
    throw error; // Rethrow for outer catch
  }
}

export async function GET(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] GET: Fetching profile`, { profileId: params.id });

  try {
    const session = await getServerSession(authOptions);
    const validation = await validateRequest({ params, session, requestId });
    if (validation instanceof NextResponse) return validation;

    const { profileId, userId } = validation;
    const profile = await findProfile(profileId, requestId);
    if (profile instanceof NextResponse) return profile;

    // Restrict access to pending profiles
    if (
      profile.status !== "approved" &&
      (!userId || userId !== profile.userId._id.toString())
    ) {
      console.error(`[${requestId}] Unauthorized: Pending profile`, {
        profileId,
      });
      return NextResponse.json(
        { error: "Forbidden: Profile is pending" },
        { status: 403 }
      );
    }

    console.log(`[${requestId}] Profile fetched successfully`, { profileId });
    return NextResponse.json(profile);
  } catch (error) {
    console.error(`[${requestId}] GET error`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] PUT: Updating profile`, { profileId: params.id });

  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";
    const validation = await validateRequest({
      params,
      session,
      requireAdmin: isAdmin,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { profileId, userId } = validation;
    const data = await request.json();

    const profile = await findProfile(profileId, requestId);
    if (profile instanceof NextResponse) return profile;

    // Authorization check
    if (!isAdmin && profile.userId._id.toString() !== userId) {
      console.error(`[${requestId}] Unauthorized: User does not own profile`, {
        profileId,
        userId,
      });
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own profile" },
        { status: 403 }
      );
    }

    // Validate required fields for non-admins
    if (!isAdmin) {
      if (!data.name || !data.age || !data.gender) {
        console.error(`[${requestId}] Missing required fields`, { data });
        return NextResponse.json(
          { error: "Name, age, and gender are required" },
          { status: 400 }
        );
      }
      if (data.age < 18) {
        console.error(`[${requestId}] Invalid age`, { age: data.age });
        return NextResponse.json(
          { error: "Age must be 18 or older" },
          { status: 400 }
        );
      }
    }

    // Sanitize update data
    const updateData = { ...data, updatedAt: new Date() };
    if (!isAdmin) {
      delete updateData.userId;
      delete updateData.status;
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "email");

    if (!updatedProfile) {
      console.error(`[${requestId}] Failed to update profile`, { profileId });
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Profile updated successfully`, { profileId });
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error(`[${requestId}] PUT error`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const requestId = Date.now().toString();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  console.log(`[${requestId}] PATCH: Processing`, {
    profileId: params.id,
    action,
  });

  try {
    const session = await getServerSession(authOptions);
    const validation = await validateRequest({
      params,
      session,
      requireAdmin: true,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { profileId } = validation;
    const profile = await findProfile(profileId, requestId);
    if (profile instanceof NextResponse) return profile;

    let updateData;
    if (action === "activate") {
      updateData = { status: "approved", updatedAt: new Date() };
    } else if (action === "deactivate") {
      updateData = { status: "inactive", updatedAt: new Date() };
    } else {
      const data = await request.json();
      if (data.name !== undefined && !data.name) {
        console.error(`[${requestId}] Name cannot be empty`);
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      if (data.age !== undefined && (!data.age || data.age < 18)) {
        console.error(`[${requestId}] Invalid age`, { age: data.age });
        return NextResponse.json(
          { error: "Age must be 18 or older" },
          { status: 400 }
        );
      }
      if (data.gender !== undefined && !data.gender) {
        console.error(`[${requestId}] Gender cannot be empty`);
        return NextResponse.json(
          { error: "Gender cannot be empty" },
          { status: 400 }
        );
      }
      updateData = { ...data, updatedAt: new Date() };
      delete updateData.userId;
      delete updateData.status;
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      profileId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userId", "email");

    if (!updatedProfile) {
      console.error(`[${requestId}] Failed to update profile`, { profileId });
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Profile updated successfully`, {
      profileId,
      action,
    });
    return NextResponse.json({
      message: `Profile ${action || "updated"} successfully`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(`[${requestId}] PATCH error`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] DELETE: Attempting to delete profile`, {
    profileId: params.id,
  });

  try {
    const session = await getServerSession(authOptions);
    const validation = await validateRequest({
      params,
      session,
      requireAdmin: true,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { profileId } = validation;
    const profile = await findProfile(profileId, requestId);
    if (profile instanceof NextResponse) return profile;

    await Profile.findByIdAndDelete(profileId);
    console.log(`[${requestId}] Profile deleted successfully`, { profileId });
    return NextResponse.json({ message: "Profile deleted" }, { status: 200 });
  } catch (error) {
    console.error(`[${requestId}] DELETE error`, {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
