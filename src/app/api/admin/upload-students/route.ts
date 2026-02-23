import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { parseStudentsExcel } from "@/lib/excel/parse-students";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { students, errors } = await parseStudentsExcel(buffer);

    // If there are validation errors with no valid students, return errors
    if (students.length === 0) {
      return NextResponse.json({ errors, imported: 0 }, { status: 400 });
    }

    // Fetch existing students from Firestore to compute deletions
    const existingSnapshot = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .get();

    const excelEmails = new Set(students.map((s) => s.email.toLowerCase()));
    const toDeleteDocs = existingSnapshot.docs.filter(
      (d) => !excelEmails.has(d.id)
    );
    const toDelete = toDeleteDocs.map((d) => ({
      email: d.id,
      familyNameEn: d.data().familyNameEn as string | undefined,
      firstNameEn: d.data().firstNameEn as string | undefined,
      studentId: d.data().studentId as string | undefined,
      faculty: d.data().faculty as string | undefined,
    }));

    // Check for confirm flag — first call returns preview, second call with confirm=true writes data
    const confirm = formData.get("confirm") === "true";

    if (!confirm) {
      return NextResponse.json({ students, errors, toDelete, preview: true });
    }

    // Write to Firestore
    const batch = adminDb.batch();
    const now = new Date().toISOString();
    let imported = 0;

    // Delete students no longer in Excel
    for (const doc of toDeleteDocs) {
      batch.delete(adminDb.collection("users").doc(doc.id));
      batch.delete(adminDb.collection("emailStudentMap").doc(doc.id));
    }

    for (const student of students) {
      // Check if row had errors
      const rowErrors = errors.filter(
        (e) => students.indexOf(student) + 2 === e.row
      );
      if (rowErrors.length > 0) continue;

      const emailKey = student.email.toLowerCase();

      // Create/update emailStudentMap entry
      const emailMapRef = adminDb.collection("emailStudentMap").doc(emailKey);
      batch.set(emailMapRef, {
        ...student,
        email: emailKey,
        updatedAt: now,
      }, { merge: true });

      // Upsert users/{email} doc
      const userRef = adminDb.collection("users").doc(emailKey);
      const userDoc = existingSnapshot.docs.find((d) => d.id === emailKey);

      const taFields = {
        familyNameEn: student.familyNameEn,
        firstNameEn: student.firstNameEn,
        fullChineseName: student.fullChineseName,
        gender: student.gender,
        faculty: student.faculty,
        studentId: student.studentId,
        passportCountry: student.passportCountry,
        hasChinaBankAccount: student.hasChinaBankAccount,
        telephone: student.telephone,
        specialRequest: student.specialRequest,
        updatedAt: now,
      };

      if (userDoc?.exists) {
        batch.update(userRef, taFields);
      } else {
        batch.set(userRef, {
          ...taFields,
          authUid: emailKey,
          email: emailKey,
          role: "student",
          departureFlight: { date: "", time: "", flightNumber: "" },
          arrivalFlight: { date: "", time: "", flightNumber: "" },
          visaStatus: "",
          visaNotes: "",
          emergencyContact: { name: "", relationship: "", phone: "", email: "" },
          dietaryRestrictions: "",
          medicalConditions: "",
          createdAt: now,
        });
      }

      imported++;
    }

    await batch.commit();

    return NextResponse.json({
      imported,
      deleted: toDelete.length,
      errors: errors.filter((e) => e.row > 0),
    });
  } catch (error) {
    console.error("Upload students error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
