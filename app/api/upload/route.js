import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const requestId = Date.now().toString();
  try {
    console.log(
      JSON.stringify(
        {
          message: "Image upload request received",
          requestId,
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers),
        },
        null,
        2
      )
    );

    // Check session for authentication
    const session = await getServerSession(authOptions);
    console.log(
      JSON.stringify(
        {
          message: "Session data",
          requestId,
          session: session ? session : "Null",
        },
        null,
        2
      )
    );
    if (!session || !session.user?.id) {
      console.log(
        JSON.stringify(
          {
            message: "Session invalid: Missing user.id",
            requestId,
            session: session ? session : "Null",
            user: session?.user ? session.user : "No user",
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
    console.log(
      JSON.stringify(
        { message: "Session validated", requestId, userId: session.user.id },
        null,
        2
      )
    );

    const formData = await request.formData();
    const file = formData.get("image"); // Match formData.append("image", file)
    if (!file) {
      console.log(
        JSON.stringify(
          { message: "No image file provided", requestId },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.log(
        JSON.stringify(
          {
            message: "Invalid file type",
            requestId,
            fileType: file.type,
            allowedTypes,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      console.log(
        JSON.stringify(
          {
            message: "File size too large",
            requestId,
            fileSize: file.size,
            maxSize,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "File size exceeds 5MB" },
        { status: 400 }
      );
    }

    // Sanitize file name
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    console.log(
      JSON.stringify(
        {
          message: "Processing image upload",
          requestId,
          fileName,
          fileSize: file.size,
          fileType: file.type,
        },
        null,
        2
      )
    );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate Cloudinary upload preset
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;
    if (!uploadPreset) {
      console.log(
        JSON.stringify(
          {
            message: "Cloudinary upload preset not configured",
            requestId,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Missing Cloudinary upload preset",
        },
        { status: 500 }
      );
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: `matrimonial/${session.user.id}`, // User-specific folder
            public_id: `${fileName}_${requestId}`, // Unique public ID
            upload_preset: uploadPreset,
            transformation: [
              { width: 512, height: 512, crop: "fill" },
              { quality: "auto", fetch_format: "auto" }, // Optimize image
            ],
            // Enable signed upload for security
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if (!result.secure_url) {
      console.log(
        JSON.stringify(
          {
            message: "Cloudinary upload failed: No secure_url returned",
            requestId,
            result,
          },
          null,
          2
        )
      );
      return NextResponse.json(
        { error: "Failed to upload image: No secure URL returned" },
        { status: 500 }
      );
    }

    console.log(
      JSON.stringify(
        {
          message: "Image uploaded to Cloudinary",
          requestId,
          secure_url: result.secure_url,
          public_id: result.public_id,
        },
        null,
        2
      )
    );

    // Set caching headers to prevent unnecessary requests
    const response = NextResponse.json({ secure_url: result.secure_url });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error(
      JSON.stringify(
        {
          message: "Image upload error",
          requestId,
          error: error.message,
          stack: error.stack,
        },
        null,
        2
      )
    );
    return NextResponse.json(
      { error: `Failed to upload image: ${error.message}` },
      { status: 500 }
    );
  }
}

// Disable body parsing for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};
