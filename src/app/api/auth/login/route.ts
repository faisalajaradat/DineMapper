export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import User from "@/models/User";
import { initDatabase } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const sequelize = await initDatabase();
    User.initModel(sequelize);

    const userInstance = await User.findOne({ where: { email } });
    if (!userInstance) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    const user = userInstance.get();
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      uuid: user.uuid,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const response = NextResponse.json({ message: "Login successful" });

    response.cookies.set("authToken", token, {
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}