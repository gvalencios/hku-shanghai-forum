import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@/lib/types/user";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-secret-change-in-production"
  );
}

export interface SessionPayload extends JWTPayload {
  uid: string;
  email: string;
  role: UserRole;
}

export async function signSession(
  payload: Omit<SessionPayload, keyof JWTPayload>
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
