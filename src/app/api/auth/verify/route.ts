import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(JWT_SECRET);

type JwtPayload = {
  uuid: string;
  email: string;
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header missing or malformed" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ message: "Token missing" }, { status: 401 });
    }

    // Verify JWT using jose
    const { payload } = await jwtVerify(token, secret);

    const { uuid, email } = payload as JwtPayload;

    if (!uuid || !email) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      {
        user: { uuid, email },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}