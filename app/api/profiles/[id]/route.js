import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Utility function for validation and session checks
async function validateRequest({
  userId,
  session,
  requireAdmin = false,
  requestId,
}) {
  console.log(`[${requestId}] LOG: Validating request`, {
    userId,
    requireAdmin,
  });

  if (!userId || typeof userId !== "string") {
    console.error(
      JSON.stringify(
        { message: `[${requestId}] User ID missing or invalid`, requestId },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: "User ID is required and must be a string" },
      { status: 400 }
    );
  }

  await db();

  if (!session) {
    console.error(
      JSON.stringify(
        { message: `[${requestId}] Unauthorized: No session`, requestId },
        null,
        5
      )
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (requireAdmin && session.user?.role !== "admin") {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] Unauthorized: Not admin`,
          requestId,
          user: { id: session.user?.id, role: session.user?.role },
        },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return { userId, currentUserId: session.user?.id };
}

// Helper to validate profile existence
async function findProfile(userId, requestId) {
  try {
    const profile = await Profile.findOne({ userId }).lean();
    if (!profile) {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Profile not found: ${userId}`, requestId },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return profile;
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] Error finding profile: ${userId}`,
          requestId,
          error: error.message,
        },
        null,
        5
      )
    );
    throw error;
  }
}

// Validation function for profile fields (aligned with app/api/profiles/route.js)
async function validateProfileFields(data, requestId, isPartial = false) {
  const requiredFields = [
    "name",
    "location",
    "age",
    "gender",
    "dateOfBirth",
    "maritalStatus",
    "phone",
    "height",
    "weight",
    "complexion",
    "religion",
    "caste",
    "diet",
    "smoking",
    "drinking",
    "education.degree",
    "education.institution",
    "occupation",
    "income",
    "familyType",
    "familyStatus",
    "familyValues",
    "partnerAgeMin",
    "partnerAgeMax",
    "partnerReligion",
    "partnerCaste",
    "bio",
    "photos",
  ];

  if (!isPartial) {
    const missingFields = requiredFields.filter((field) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return (
          !data[parent] ||
          data[parent][child] == null ||
          data[parent][child] === ""
        );
      }
      return data[field] == null || data[field] === "";
    });
    if (missingFields.length > 0) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Missing required fields: ${missingFields.join(
              ", "
            )}`,
            requestId,
          },
          null,
          5
        )
      );
      return `Missing required fields: ${missingFields.join(", ")}`;
    }
  }

  if (data.age !== undefined && data.age < 18) {
    console.error(
      JSON.stringify(
        { message: `[${requestId}] Invalid age: ${data.age}`, requestId },
        null,
        5
      )
    );
    return "Age must be 18 or older";
  }

  if (
    data.dateOfBirth !== undefined &&
    (!data.dateOfBirth || isNaN(new Date(data.dateOfBirth).getTime()))
  ) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] Invalid dateOfBirth: ${data.dateOfBirth}`,
          requestId,
        },
        null,
        5
      )
    );
    return "Invalid date of birth";
  }

  if (
    data.partnerAgeMin !== undefined &&
    data.partnerAgeMax !== undefined &&
    data.partnerAgeMax < data.partnerAgeMin
  ) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] Invalid partner age range: max ${data.partnerAgeMax} < min ${data.partnerAgeMin}`,
          requestId,
        },
        null,
        5
      )
    );
    return "Maximum partner age must be greater than or equal to minimum";
  }

  if (data.photos !== undefined) {
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] At least one photo is required`,
            requestId,
          },
          null,
          5
        )
      );
      return "At least one photo is required";
    }
    for (const photo of data.photos) {
      try {
        new URL(photo);
      } catch {
        console.error(
          JSON.stringify(
            {
              message: `[${requestId}] Invalid photo URL: ${photo}`,
              requestId,
            },
            null,
            5
          )
        );
        return `Invalid photo URL: ${photo}`;
      }
    }
  }

  if (data.education !== undefined) {
    if (typeof data.education !== "object") {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid education: must be an object`,
            requestId,
          },
          null,
          5
        )
      );
      return "Education must be an object";
    }
    if (
      data.education.graduationYear !== undefined &&
      (data.education.graduationYear < 1950 ||
        data.education.graduationYear > new Date().getFullYear())
    ) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid education.graduationYear: ${data.education.graduationYear}`,
            requestId,
          },
          null,
          5
        )
      );
      return `Graduation year must be between 1950 and ${new Date().getFullYear()}`;
    }
  }

  const enums = {
    gender: ["Male", "Female", "Other"],
    maritalStatus: ["Never Married", "Divorced", "Widowed"],
    complexion: ["Fair", "Medium", "Dark"],
    religion: [
      "Hindu",
      "Muslim",
      "Christian",
      "Sikh",
      "Jain",
      "Buddhist",
      "Jewish",
      "Parsi",
      "Baháʼí",
      "Other",
    ],
    caste: ["General", "OBC", "SC/ST"],
    diet: ["Vegetarian", "Non-Vegetarian", "Vegan"],
    smoking: ["Non-Smoker", "Occasional", "Regular"],
    drinking: ["Non-Drinker", "Occasional", "Regular"],
    familyType: ["Nuclear", "Joint", "Extended"],
    familyStatus: ["Middle Class", "Upper Class", "Lower Class"],
    familyValues: ["Traditional", "Moderate", "Liberal"],
    partnerReligion: [
      "Hindu",
      "Muslim",
      "Christian",
      "Sikh",
      "Jain",
      "Buddhist",
      "Jewish",
      "Parsi",
      "Baháʼí",
      "Other",
    ],
    partnerCaste: ["General", "OBC", "SC/ST"],
  };
  for (const [field, values] of Object.entries(enums)) {
    if (data[field] !== undefined && !values.includes(data[field])) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid ${field}: ${data[field]}`,
            requestId,
          },
          null,
          5
        )
      );
      return `Invalid ${field}: must be one of ${values.join(", ")}`;
    }
  }

  return null;
}

export async function GET(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] LOG: GET: Fetching profile`, { params });

  try {
    if (!params || typeof params !== "object") {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid params object`,
            requestId,
            params,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Invalid route parameters" },
        { status: 400 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Invalid profile ID`, requestId, id },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Profile ID is required and must be a string" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Unauthorized: No session`, requestId },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = id;
    if (id === "me") {
      userId = session.user?.id;
      if (!userId) {
        console.error(
          JSON.stringify(
            {
              message: `[${requestId}] Invalid user ID in session`,
              requestId,
              userId: session.user?.id,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          { error: "Invalid user ID in session" },
          { status: 400 }
        );
      }
    }

    console.log(`[${requestId}] LOG: Fetching profile for userId: ${userId}`);
    const profile = await findProfile(userId, requestId);
    if (profile instanceof NextResponse) return profile;

    if (
      profile.status !== "approved" &&
      (!session.user?.id || session.user.id !== profile.userId)
    ) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Unauthorized: Pending profile`,
            requestId,
            id,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Forbidden: Profile is pending" },
        { status: 403 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: `[${requestId}] Profile fetched successfully`,
          requestId,
          id,
        },
        null,
        5
      )
    );
    return NextResponse.json({ profile });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] GET error`,
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] LOG: PUT: Updating profile`, { params });

  try {
    if (!params || typeof params !== "object") {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid params object`,
            requestId,
            params,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Invalid route parameters" },
        { status: 400 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Invalid profile ID`, requestId, id },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Profile ID is required and must be a string" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Unauthorized: No session`, requestId },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = id;
    if (id === "me") {
      userId = session.user?.id;
      if (!userId) {
        console.error(
          JSON.stringify(
            {
              message: `[${requestId}] Invalid user ID in session`,
              requestId,
              userId: session.user?.id,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          { error: "Invalid user ID in session" },
          { status: 400 }
        );
      }
    }

    const validation = await validateRequest({
      userId,
      session,
      requireAdmin: false,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { userId: validatedUserId, currentUserId } = validation;
    const profile = await findProfile(validatedUserId, requestId);
    if (profile instanceof NextResponse) return profile;

    if (profile.userId !== currentUserId) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Unauthorized: User does not own profile`,
            requestId,
            userId: validatedUserId,
            currentUserId,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own profile" },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log(`[${requestId}] LOG: Profile update data received`, data);

    const validationError = await validateProfileFields(data, requestId, true);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updatedFields = {
      name: data.name ?? profile.name,
      location: data.location ?? profile.location,
      birthLocation: data.birthLocation ?? profile.birthLocation,
      workLocation: data.workLocation ?? profile.workLocation,
      age: data.age !== undefined ? Number(data.age) : profile.age,
      gender: data.gender ?? profile.gender,
      dateOfBirth:
        data.dateOfBirth !== undefined
          ? new Date(data.dateOfBirth)
          : profile.dateOfBirth,
      maritalStatus: data.maritalStatus ?? profile.maritalStatus,
      phone: data.phone ?? profile.phone,
      height: data.height !== undefined ? Number(data.height) : profile.height,
      weight: data.weight !== undefined ? Number(data.weight) : profile.weight,
      complexion: data.complexion ?? profile.complexion,
      religion: data.religion ?? profile.religion,
      caste: data.caste ?? profile.caste,
      diet: data.diet ?? profile.diet,
      smoking: data.smoking ?? profile.smoking,
      drinking: data.drinking ?? profile.drinking,
      education: {
        degree: data.education?.degree ?? profile.education.degree,
        institution:
          data.education?.institution ?? profile.education.institution,
        fieldOfStudy:
          data.education?.fieldOfStudy ?? profile.education.fieldOfStudy,
        graduationYear:
          data.education?.graduationYear !== undefined
            ? Number(data.education.graduationYear)
            : profile.education.graduationYear,
      },
      occupation: data.occupation ?? profile.occupation,
      income: data.income !== undefined ? Number(data.income) : profile.income,
      familyType: data.familyType ?? profile.familyType,
      familyStatus: data.familyStatus ?? profile.familyStatus,
      familyValues: data.familyValues ?? profile.familyValues,
      partnerAgeMin:
        data.partnerAgeMin !== undefined
          ? Number(data.partnerAgeMin)
          : profile.partnerAgeMin,
      partnerAgeMax:
        data.partnerAgeMax !== undefined
          ? Number(data.partnerAgeMax)
          : profile.partnerAgeMax,
      partnerReligion: data.partnerReligion ?? profile.partnerReligion,
      partnerCaste: data.partnerCaste ?? profile.partnerCaste,
      bio: data.bio ?? profile.bio,
      photos: data.photos ?? profile.photos,
      status: profile.status,
      updatedAt: new Date(),
    };

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: validatedUserId },
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProfile) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Failed to update profile`,
            requestId,
            userId: validatedUserId,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: `[${requestId}] Profile updated successfully`,
          requestId,
          userId: validatedUserId,
        },
        null,
        5
      )
    );
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] PUT error`,
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
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
  console.log(`[${requestId}] LOG: PATCH: Processing`, { params, action });

  try {
    if (!params || typeof params !== "object") {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid params object`,
            requestId,
            params,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Invalid route parameters" },
        { status: 400 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Invalid profile ID`, requestId, id },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Profile ID is required and must be a string" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Unauthorized: No session`, requestId },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = id;
    if (id === "me") {
      userId = session.user?.id;
      if (!userId) {
        console.error(
          JSON.stringify(
            {
              message: `[${requestId}] Invalid user ID in session`,
              requestId,
              userId: session.user?.id,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          { error: "Invalid user ID in session" },
          { status: 400 }
        );
      }
    }

    const validation = await validateRequest({
      userId,
      session,
      requireAdmin: true,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { userId: validatedUserId } = validation;
    const profile = await findProfile(validatedUserId, requestId);
    if (profile instanceof NextResponse) return profile;

    let updateData;
    if (action === "activate") {
      updateData = { status: "approved", updatedAt: new Date() };
    } else if (action === "deactivate") {
      updateData = { status: "rejected", updatedAt: new Date() };
    } else {
      const data = await request.json();
      console.log(`[${requestId}] LOG: Profile update data received`, data);

      const validationError = await validateProfileFields(
        data,
        requestId,
        true
      );
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      updateData = {
        name: data.name ?? profile.name,
        location: data.location ?? profile.location,
        birthLocation: data.birthLocation ?? profile.birthLocation,
        workLocation: data.workLocation ?? profile.workLocation,
        age: data.age !== undefined ? Number(data.age) : profile.age,
        gender: data.gender ?? profile.gender,
        dateOfBirth:
          data.dateOfBirth !== undefined
            ? new Date(data.dateOfBirth)
            : profile.dateOfBirth,
        maritalStatus: data.maritalStatus ?? profile.maritalStatus,
        phone: data.phone ?? profile.phone,
        height:
          data.height !== undefined ? Number(data.height) : profile.height,
        weight:
          data.weight !== undefined ? Number(data.weight) : profile.weight,
        complexion: data.complexion ?? profile.complexion,
        religion: data.religion ?? profile.religion,
        caste: data.caste ?? profile.caste,
        diet: data.diet ?? profile.diet,
        smoking: data.smoking ?? profile.smoking,
        drinking: data.drinking ?? profile.drinking,
        education: {
          degree: data.education?.degree ?? profile.education.degree,
          institution:
            data.education?.institution ?? profile.education.institution,
          fieldOfStudy:
            data.education?.fieldOfStudy ?? profile.education.fieldOfStudy,
          graduationYear:
            data.education?.graduationYear !== undefined
              ? Number(data.education.graduationYear)
              : profile.education.graduationYear,
        },
        occupation: data.occupation ?? profile.occupation,
        income:
          data.income !== undefined ? Number(data.income) : profile.income,
        familyType: data.familyType ?? profile.familyType,
        familyStatus: data.familyStatus ?? profile.familyStatus,
        familyValues: data.familyValues ?? profile.familyValues,
        partnerAgeMin:
          data.partnerAgeMin !== undefined
            ? Number(data.partnerAgeMin)
            : profile.partnerAgeMin,
        partnerAgeMax:
          data.partnerAgeMax !== undefined
            ? Number(data.partnerAgeMax)
            : profile.partnerAgeMax,
        partnerReligion: data.partnerReligion ?? profile.partnerReligion,
        partnerCaste: data.partnerCaste ?? profile.partnerCaste,
        bio: data.bio ?? profile.bio,
        photos: data.photos ?? profile.photos,
        updatedAt: new Date(),
      };
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: validatedUserId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProfile) {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Failed to update profile`,
            requestId,
            userId: validatedUserId,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: `[${requestId}] Profile updated successfully`,
          requestId,
          userId: validatedUserId,
          action,
        },
        null,
        5
      )
    );
    return NextResponse.json({
      message: `Profile ${action || "updated"} successfully`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] PATCH error`,
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const requestId = Date.now().toString();
  console.log(`[${requestId}] LOG: DELETE: Attempting to delete profile`, {
    params,
  });

  try {
    if (!params || typeof params !== "object") {
      console.error(
        JSON.stringify(
          {
            message: `[${requestId}] Invalid params object`,
            requestId,
            params,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Invalid route parameters" },
        { status: 400 }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Invalid profile ID`, requestId, id },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Profile ID is required and must be a string" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      console.error(
        JSON.stringify(
          { message: `[${requestId}] Unauthorized: No session`, requestId },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = id;
    if (id === "me") {
      userId = session.user?.id;
      if (!userId) {
        console.error(
          JSON.stringify(
            {
              message: `[${requestId}] Invalid user ID in session`,
              requestId,
              userId: session.user?.id,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          { error: "Invalid user ID in session" },
          { status: 400 }
        );
      }
    }

    const validation = await validateRequest({
      userId,
      session,
      requireAdmin: true,
      requestId,
    });
    if (validation instanceof NextResponse) return validation;

    const { userId: validatedUserId } = validation;
    const profile = await findProfile(validatedUserId, requestId);
    if (profile instanceof NextResponse) return profile;

    await Profile.deleteOne({ userId: validatedUserId });
    console.log(
      JSON.stringify(
        {
          message: `[${requestId}] Profile deleted successfully`,
          requestId,
          userId: validatedUserId,
        },
        null,
        5
      )
    );
    return NextResponse.json({ message: "Profile deleted" }, { status: 200 });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: `[${requestId}] DELETE error`,
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
