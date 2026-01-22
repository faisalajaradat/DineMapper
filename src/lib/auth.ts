import "server-only";
import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * What your JWT contains
 */
export interface JwtPayload {
  id: string;
  email: string;
}

/**
 * Sign a JWT
 */
export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify a JWT and return typed payload
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      email: payload.email as string,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}