import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Profile } from "@/models/Profile";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Utility function to validate session
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

// Validation function for profile fields
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

  // Check missing fields only for non-partial updates
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
            message: `Missing required fields: ${missingFields.join(", ")}`,
            requestId,
          },
          null,
          2
        )
      );
      return `Missing required fields: ${missingFields.join(", ")}`;
    }
  }

  // Validate age
  if (data.age !== undefined && data.age < 18) {
    console.error(
      JSON.stringify(
        { message: `Invalid age: ${data.age}`, requestId },
        null,
        2
      )
    );
    return "Age must be 18 or older";
  }

  // Validate dateOfBirth
  if (
    data.dateOfBirth !== undefined &&
    (!data.dateOfBirth || isNaN(new Date(data.dateOfBirth).getTime()))
  ) {
    console.error(
      JSON.stringify(
        { message: `Invalid dateOfBirth: ${data.dateOfBirth}`, requestId },
        null,
        2
      )
    );
    return "Invalid date of birth";
  }

  // Validate partner age range
  if (
    data.partnerAgeMin !== undefined &&
    data.partnerAgeMax !== undefined &&
    data.partnerAgeMax < data.partnerAgeMin
  ) {
    console.error(
      JSON.stringify(
        {
          message: `Invalid partner age range: max ${data.partnerAgeMax} < min ${data.partnerAgeMin}`,
          requestId,
        },
        null,
        2
      )
    );
    return "Maximum partner age must be greater than or equal to minimum";
  }

  // Validate photos
  if (data.photos !== undefined) {
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      console.error(
        JSON.stringify(
          { message: "At least one photo is required", requestId },
          null,
          2
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
            { message: `Invalid photo URL: ${photo}`, requestId },
            null,
            2
          )
        );
        return `Invalid photo URL: ${photo}`;
      }
    }
  }

  // Validate education subfields
  if (data.education !== undefined) {
    if (typeof data.education !== "object") {
      console.error(
        JSON.stringify(
          { message: `Invalid education: must be an object`, requestId },
          null,
          2
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
            message: `Invalid education.graduationYear: ${data.education.graduationYear}`,
            requestId,
          },
          null,
          2
        )
      );
      return `Graduation year must be between 1950 and ${new Date().getFullYear()}`;
    }
  }

  // Validate enum fields
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
          { message: `Invalid ${field}: ${data[field]}`, requestId },
          null,
          2
        )
      );
      return `Invalid ${field}: must be one of ${values.join(", ")}`;
    }
  }

  return null; // No validation errors
}

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    console.log(
      JSON.stringify(
        { message: "Session validated", requestId, userId: session.user.id },
        null,
        5
      )
    );

    await db();
    console.log(`[${requestId}] LOG: Database connected`);

    const data = await request.json();
    console.log(`[${requestId}] LOG: Profile data received`, data);

    const validationError = await validateProfileFields(data, requestId);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingProfile = await Profile.findOne({ userId: session.user.id });
    if (existingProfile) {
      console.error(
        JSON.stringify(
          {
            message: `Profile already exists for user: ${session.user.id}`,
            requestId,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 }
      );
    }

    const sanitizedProfileData = {
      name: data.name,
      location: data.location,
      birthLocation: data.birthLocation || "",
      workLocation: data.workLocation || "",
      age: Number(data.age),
      gender: data.gender,
      dateOfBirth: new Date(data.dateOfBirth),
      maritalStatus: data.maritalStatus,
      phone: data.phone,
      height: Number(data.height),
      weight: Number(data.weight),
      complexion: data.complexion,
      religion: data.religion,
      caste: data.caste,
      diet: data.diet,
      smoking: data.smoking,
      drinking: data.drinking,
      education: {
        degree: data.education.degree,
        institution: data.education.institution,
        fieldOfStudy: data.education.fieldOfStudy || "",
        graduationYear: data.education.graduationYear
          ? Number(data.education.graduationYear)
          : null,
      },
      occupation: data.occupation,
      income: Number(data.income),
      familyType: data.familyType,
      familyStatus: data.familyStatus,
      familyValues: data.familyValues,
      partnerAgeMin: Number(data.partnerAgeMin),
      partnerAgeMax: Number(data.partnerAgeMax),
      partnerReligion: data.partnerReligion,
      partnerCaste: data.partnerCaste,
      bio: data.bio,
      photos: data.photos,
      userId: session.user.id,
      status: "pending",
    };

    const profile = await Profile.create(sanitizedProfileData);
    console.log(
      JSON.stringify(
        {
          message: `Profile created: ${profile._id}`,
          requestId,
          profileId: profile._id,
        },
        null,
        5
      )
    );

    return NextResponse.json({
      message: "Profile created",
      requestId,
      profileId: profile._id,
      profile: profile.toObject(),
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Profiles POST error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create profile: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const requestId = Date.now().toString();
  try {
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    console.log(
      JSON.stringify(
        { message: "Session validated", requestId, userId: session.user.id },
        null,
        5
      )
    );

    await db();
    console.log(`[${requestId}] LOG: Database connected`);

    const data = await request.json();
    console.log(`[${requestId}] LOG: Profile update data received`, data);

    const existingProfile = await Profile.findOne({ userId: session.user.id });
    if (!existingProfile) {
      console.error(
        JSON.stringify(
          {
            message: `Profile not found for user: ${session.user.id}`,
            requestId,
          },
          null,
          5
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const validationError = await validateProfileFields(data, requestId, true);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const updatedFields = {
      name: data.name ?? existingProfile.name,
      location: data.location ?? existingProfile.location,
      birthLocation: data.birthLocation ?? existingProfile.birthLocation,
      workLocation: data.workLocation ?? existingProfile.workLocation,
      age: data.age !== undefined ? Number(data.age) : existingProfile.age,
      gender: data.gender ?? existingProfile.gender,
      dateOfBirth:
        data.dateOfBirth !== undefined
          ? new Date(data.dateOfBirth)
          : existingProfile.dateOfBirth,
      maritalStatus: data.maritalStatus ?? existingProfile.maritalStatus,
      phone: data.phone ?? existingProfile.phone,
      height:
        data.height !== undefined
          ? Number(data.height)
          : existingProfile.height,
      weight:
        data.weight !== undefined
          ? Number(data.weight)
          : existingProfile.weight,
      complexion: data.complexion ?? existingProfile.complexion,
      religion: data.religion ?? existingProfile.religion,
      caste: data.caste ?? existingProfile.caste,
      diet: data.diet ?? existingProfile.diet,
      smoking: data.smoking ?? existingProfile.smoking,
      drinking: data.drinking ?? existingProfile.drinking,
      education: {
        degree: data.education?.degree ?? existingProfile.education.degree,
        institution:
          data.education?.institution ?? existingProfile.education.institution,
        fieldOfStudy:
          data.education?.fieldOfStudy ??
          existingProfile.education.fieldOfStudy,
        graduationYear:
          data.education?.graduationYear !== undefined
            ? Number(data.education.graduationYear)
            : existingProfile.education.graduationYear,
      },
      occupation: data.occupation ?? existingProfile.occupation,
      income:
        data.income !== undefined
          ? Number(data.income)
          : existingProfile.income,
      familyType: data.familyType ?? existingProfile.familyType,
      familyStatus: data.familyStatus ?? existingProfile.familyStatus,
      familyValues: data.familyValues ?? existingProfile.familyValues,
      partnerAgeMin:
        data.partnerAgeMin !== undefined
          ? Number(data.partnerAgeMin)
          : existingProfile.partnerAgeMin,
      partnerAgeMax:
        data.partnerAgeMax !== undefined
          ? Number(data.partnerAgeMax)
          : existingProfile.partnerAgeMax,
      partnerReligion: data.partnerReligion ?? existingProfile.partnerReligion,
      partnerCaste: data.partnerCaste ?? existingProfile.partnerCaste,
      bio: data.bio ?? existingProfile.bio,
      photos: data.photos ?? existingProfile.photos,
      status: existingProfile.status, // Preserve existing status
      updatedAt: new Date(),
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!profile) {
      console.error(
        JSON.stringify(
          {
            message: `Failed to update profile: not found for user ${session.user.id}`,
            requestId,
          },
          null,
          5
        )
      );
      return NextResponse.json(
        { error: "Failed to update profile: not found" },
        { status: 404 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: `Profile updated: ${profile._id}`,
          requestId,
          profileId: profile._id,
        },
        null,
        5
      )
    );

    return NextResponse.json({
      message: "Profile updated",
      requestId,
      profileId: profile._id,
      profile: profile.toObject(),
    });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Profiles PUT error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to update profile: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const requestId = Date.now().toString();
  try {
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    console.log(
      JSON.stringify(
        {
          message: "Session validated",
          requestId,
          userId: session.user.id,
          role: session.user.role,
        },
        null,
        5
      )
    );

    await db();
    console.log(`[${requestId}] LOG: Database connected`);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const statusFilter = searchParams.get("status");
    const adminView = searchParams.get("adminView") === "true";

    if (userId) {
      // Fetch single profile by userId
      if (userId !== session.user.id && session.user.role !== "admin") {
        console.error(
          JSON.stringify(
            {
              message:
                "Unauthorized: Can only view own profile or admin access required",
              requestId,
              userId,
              role: session.user.role,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          {
            error:
              "Forbidden: Can only view own profile or admin access required",
          },
          { status: 403 }
        );
      }

      const profile = await Profile.findOne({ userId }).lean();
      if (!profile) {
        console.error(
          JSON.stringify(
            {
              message: `Profile not found for userId: ${userId}`,
              requestId,
            },
            null,
            5
          )
        );
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      // Restrict access to pending profiles
      if (
        profile.status !== "approved" &&
        session.user.id !== userId &&
        session.user.role !== "admin"
      ) {
        console.error(
          JSON.stringify(
            {
              message: "Unauthorized: Profile is pending",
              requestId,
              userId,
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
            message: `Profile fetched for userId: ${userId}`,
            requestId,
            profileId: profile._id,
          },
          null,
          5
        )
      );

      return NextResponse.json({ profile });
    }

    // Fetch multiple profiles (existing behavior)
    if (adminView && session.user.role !== "admin") {
      console.error(
        JSON.stringify(
          {
            message: "GET /api/profiles: Admin access required",
            requestId,
            role: session.user.role,
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

    let query = {};
    if (adminView) {
      if (statusFilter) {
        query.status = statusFilter;
      }
    } else {
      query.status = "approved";
    }

    console.log(
      JSON.stringify(
        { message: "Querying profiles", requestId, query },
        null,
        5
      )
    );

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const profiles = await Profile.find(query).skip(skip).limit(limit).lean();
    console.log(
      JSON.stringify(
        {
          message: "Profiles queried",
          requestId,
          profileCount: profiles.length,
          profiles: profiles.map((p) => ({
            _id: p._id,
            status: p.status,
            userId: p.userId,
          })),
        },
        null,
        5
      )
    );

    const counts = {
      total: await Profile.countDocuments(),
      pending: await Profile.countDocuments({ status: "pending" }),
      approved: await Profile.countDocuments({ status: "approved" }),
      rejected: await Profile.countDocuments({ status: "rejected" }),
    };

    console.log(
      JSON.stringify(
        {
          message: "Profiles fetched",
          requestId,
          count: profiles.length,
          counts,
          role: session.user.role,
          adminView,
          statusFilter,
          page,
          limit,
        },
        null,
        5
      )
    );

    return NextResponse.json({ profiles, counts, page, limit });
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Profiles GET error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        5
      )
    );
    return NextResponse.json(
      { error: `Failed to fetch profiles: ${error.message}` },
      { status: 500 }
    );
  }
}
