import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db"; // your MongoDB connection helper
import Admin from "@/models/Admin"; // Your Mongoose Admin model

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: "admin",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Set token as HttpOnly cookie
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour
      path: "/", // cookie available across site
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
