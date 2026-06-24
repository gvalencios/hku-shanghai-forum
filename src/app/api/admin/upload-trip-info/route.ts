import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { parseTripInfoExcel } from "@/lib/excel/parse-trip-info";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { rows, errors } = await parseTripInfoExcel(buffer);

    if (rows.length === 0) {
      return NextResponse.json({ errors, imported: 0 }, { status: 400 });
    }

    // Trip info only updates existing student users (never adds/deletes).
    const existingSnapshot = await adminDb
      .collection("users")
      .where("role", "==", "student")
      .get();
    const existingEmails = new Set(existingSnapshot.docs.map((d) => d.id));

    const notFound = rows
      .filter((r) => !existingEmails.has(r.email))
      .map((r) => r.email);

    const confirm = formData.get("confirm") === "true";
    if (!confirm) {
      return NextResponse.json({ rows, errors, notFound, preview: true });
    }

    const batch = adminDb.batch();
    const now = new Date().toISOString();
    let imported = 0;

    for (const r of rows) {
      if (!existingEmails.has(r.email)) continue;

      const update: Record<string, unknown> = { updatedAt: now };
      if (r.hasFlights) {
        update.departureFlight = r.departureFlight;
        update.arrivalFlight = r.arrivalFlight;
        update.flightTicketStatus = "purchased";
      }
      if (r.hasVisa) {
        update.visaStatus = r.visaStatus;
      }

      // Only one key (updatedAt) means nothing to merge — skip.
      if (Object.keys(update).length === 1) continue;

      batch.update(adminDb.collection("users").doc(r.email), update);
      imported++;
    }

    await batch.commit();

    return NextResponse.json({
      imported,
      skipped: notFound.length,
      notFound,
      errors: errors.filter((e) => e.row > 0),
    });
  } catch (error) {
    console.error("Upload trip info error:", error);
    return NextResponse.json(
      { error: "Failed to process trip info upload" },
      { status: 500 }
    );
  }
}
