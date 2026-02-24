import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { signSession } from "@/lib/auth/jwt";
import type { UserRole } from "@/lib/types/user";

const TA_EMAILS = (process.env.TA_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const TA_PASSCODE = process.env.TA_PASSCODE ?? "";

const VALID_DOMAINS = ["hku.hk", "connect.hku.hk"];

const SESSION_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 60 * 60 * 24 * 12, // 12 days
};

export async function POST(request: NextRequest) {
  try {
    const { email, studentId } = await request.json();

    if (!email || !studentId) {
      return NextResponse.json(
        { error: "Email and Student ID are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate domain
    const domain = normalizedEmail.split("@")[1];
    if (!domain || !VALID_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: "Please use your HKU email (@hku.hk or @connect.hku.hk)" },
        { status: 400 }
      );
    }

    const isTA = TA_EMAILS.includes(normalizedEmail);
    let role: UserRole;
    const uid = normalizedEmail; // email is the uid in the new system

    if (isTA) {
      // TAs authenticate with a shared TA passcode
      if (!TA_PASSCODE || studentId !== TA_PASSCODE) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      role = "ta";

      // Ensure TA has a user document
      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        const now = new Date().toISOString();
        await userRef.set({
          authUid: uid,
          email: normalizedEmail,
          role: "ta",
          familyNameEn: "",
          firstNameEn: "",
          fullChineseName: "",
          gender: "",
          faculty: "",
          studentId: "",
          passportCountry: "",
          hasChinaBankAccount: false,
          telephone: "",
          specialRequest: "",
          departureFlight: { date: "", time: "", flightNumber: "" },
          arrivalFlight: { date: "", time: "", flightNumber: "" },
          visaStatus: "",
          visaNotes: "",
          emergencyContact: { name: "", relationship: "", phone: "", email: "" },
          dietaryRestrictions: "",
          medicalConditions: "",
          createdAt: now,
          updatedAt: now,
        });
      }
    } else {
      // Students: look up in emailStudentMap and verify student ID
      const emailMapRef = adminDb.collection("emailStudentMap").doc(normalizedEmail);
      const emailMapDoc = await emailMapRef.get();

      if (!emailMapDoc.exists) {
        return NextResponse.json(
          { error: "Email not found. Please contact your TA." },
          { status: 401 }
        );
      }

      const studentData = emailMapDoc.data()!;

      // Verify student ID (trim and case-insensitive)
      const storedId = String(studentData.studentId ?? "").trim().toLowerCase();
      const providedId = String(studentId).trim().toLowerCase();
      if (!storedId || storedId !== providedId) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      role = "student";

      // Create user document on first login if it doesn't exist
      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        const now = new Date().toISOString();
        await userRef.set({
          ...studentData,
          authUid: uid,
          email: normalizedEmail,
          role: "student",
          departureFlight: { date: "", time: "", flightNumber: "" },
          arrivalFlight: { date: "", time: "", flightNumber: "" },
          visaStatus: "",
          visaNotes: "",
          emergencyContact: { name: "", relationship: "", phone: "", email: "" },
          dietaryRestrictions: "",
          medicalConditions: "",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const token = await signSession({ uid, email: normalizedEmail, role });

    const response = NextResponse.json({ ok: true, role });
    response.cookies.set("session", token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
