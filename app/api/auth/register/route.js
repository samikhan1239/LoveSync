// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { User } from "@/models/User";

export async function POST(request) {
  try {
    await db();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "user",
    });

    return NextResponse.json({
      message: "User created",
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Registration API error:", error); // Log error for debugging
    return NextResponse.json(
      { error: "Registration failed: " + error.message },
      { status: 500 }
    );
  }
}
