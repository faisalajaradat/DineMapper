export const runtime = "nodejs";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    if (!secret) throw new Error("JWT_SECRET missing");

    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return Response.json({ message: "No auth token" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    return Response.json({ message: "Authenticated", user: payload });
  } catch (err) {
    console.error("ME route error:", err);
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
}