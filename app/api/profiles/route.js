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

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    // Validate session
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    console.log(
      JSON.stringify(
        { message: "Session validated", requestId, userId: session.user.id },
        null,
        2
      )
    );

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    const data = await request.json();
    console.log(
      JSON.stringify(
        { message: "Profile data received", requestId, data },
        null,
        2
      )
    );

    // Validate required fields (aligned with frontend schema)
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
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate age
    if (data.age < 18) {
      console.error(
        JSON.stringify(
          { message: `Invalid age: ${data.age}`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Age must be 18 or older" },
        { status: 400 }
      );
    }

    // Validate dateOfBirth
    if (!data.dateOfBirth || isNaN(new Date(data.dateOfBirth).getTime())) {
      console.error(
        JSON.stringify(
          { message: `Invalid dateOfBirth: ${data.dateOfBirth}`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Validate partner age range
    if (data.partnerAgeMax < data.partnerAgeMin) {
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
      return NextResponse.json(
        {
          error: "Maximum partner age must be greater than or equal to minimum",
        },
        { status: 400 }
      );
    }

    // Validate photos
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      console.error(
        JSON.stringify(
          { message: "At least one photo is required", requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: `Invalid photo URL: ${photo}` },
          { status: 400 }
        );
      }
    }

    // Validate education subfields
    if (data.education && typeof data.education !== "object") {
      console.error(
        JSON.stringify(
          { message: `Invalid education: must be an object`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Education must be an object" },
        { status: 400 }
      );
    }
    if (
      data.education.graduationYear &&
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
      return NextResponse.json(
        {
          error: `Graduation year must be between 1950 and ${new Date().getFullYear()}`,
        },
        { status: 400 }
      );
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
      if (data[field] && !values.includes(data[field])) {
        console.error(
          JSON.stringify(
            { message: `Invalid ${field}: ${data[field]}`, requestId },
            null
          )
        );
        return NextResponse.json(
          { error: `Invalid ${field}: must be one of ${values.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Sanitize input: only allow defined fields
    const allowedFields = {
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

    const profile = await Profile.create(allowedFields);
    console.log(
      JSON.stringify(
        {
          message: `Profile created: ${profile._id}`,
          requestId,
          profileId: profile._id,
        },
        null,
        2
      )
    );

    return NextResponse.json({
      message: `Profile created: ${profile._id}`,
      requestId,
      profileId: profile._id,
      ...profile.toObject(),
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
        2
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
    // Validate session
    const session = await validateSession(request, requestId);
    if (session instanceof NextResponse) return session;

    console.log(
      JSON.stringify(
        { message: "Session validated", requestId, userId: session.user.id },
        null,
        2
      )
    );

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    const data = await request.json();
    console.log(
      JSON.stringify(
        { message: "Profile update data received", requestId, data },
        null,
        2
      )
    );

    // Find existing profile
    const existingProfile = await Profile.findOne({ userId: session.user.id });
    if (!existingProfile) {
      console.error(
        JSON.stringify(
          {
            message: `Profile not found for user: ${session.user.id}`,
            requestId,
          },
          null,
          2
        )
      );
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Validate required fields (aligned with frontend schema)
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
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate age
    if (data.age < 18) {
      console.error(
        JSON.stringify(
          { message: `Invalid age: ${data.age}`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Age must be 18 or older" },
        { status: 400 }
      );
    }

    // Validate dateOfBirth
    if (!data.dateOfBirth || isNaN(new Date(data.dateOfBirth).getTime())) {
      console.error(
        JSON.stringify(
          { message: `Invalid dateOfBirth: ${data.dateOfBirth}`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    // Validate partner age range
    if (data.partnerAgeMax < data.partnerAgeMin) {
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
      return NextResponse.json(
        {
          error: "Maximum partner age must be greater than or equal to minimum",
        },
        { status: 400 }
      );
    }

    // Validate photos
    if (!Array.isArray(data.photos) || data.photos.length === 0) {
      console.error(
        JSON.stringify(
          { message: "At least one photo is required", requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "At least one photo is required" },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: `Invalid photo URL: ${photo}` },
          { status: 400 }
        );
      }
    }

    // Validate education subfields
    if (data.education && typeof data.education !== "object") {
      console.error(
        JSON.stringify(
          { message: `Invalid education: must be an object`, requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Education must be an object" },
        { status: 400 }
      );
    }
    if (
      data.education.graduationYear &&
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
      return NextResponse.json(
        {
          error: `Graduation year must be between 1950 and ${new Date().getFullYear()}`,
        },
        { status: 400 }
      );
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
      if (data[field] && !values.includes(data[field])) {
        console.error(
          JSON.stringify(
            { message: `Invalid ${field}: ${data[field]}`, requestId },
            null
          )
        );
        return NextResponse.json(
          { error: `Invalid ${field}: must be one of ${values.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Sanitize input: only allow defined fields
    const updatedFields = {
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
      status: existingProfile.status, // Preserve existing status
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
          2
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
        2
      )
    );

    return NextResponse.json({
      message: `Profile updated: ${profile._id}`,
      requestId,
      profileId: profile._id,
      ...profile.toObject(),
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
        2
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
    // Validate session
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
        2
      )
    );

    await db();
    console.log(
      JSON.stringify({ message: "Database connected", requestId }, null, 2)
    );

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const adminView = searchParams.get("adminView") === "true";

    // Enforce admin-only access for adminView
    if (adminView && session.user.role !== "admin") {
      console.error(
        JSON.stringify(
          {
            message: "GET /api/profiles: Admin access required",
            requestId,
            role: session.user.role,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Build query
    let query = {};
    if (adminView) {
      if (statusFilter) {
        query.status = statusFilter; // Admins with status filter (e.g., pending)
      } // Else, all profiles for admin view
    } else {
      query.userId = session.user.id; // User view: only their own profile
    }

    console.log(
      JSON.stringify(
        { message: "Querying profiles", requestId, query },
        null,
        2
      )
    );

    // Fetch profiles
    const profiles = await Profile.find(query).lean();
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
        2
      )
    );

    // Calculate counts (database-wide for consistency)
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
        },
        null,
        2
      )
    );

    return NextResponse.json({ profiles, counts });
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
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to fetch profiles: ${error.message}` },
      { status: 500 }
    );
  }
}
