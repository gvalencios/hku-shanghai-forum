import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import ExcelJS from "exceljs";

interface AccommodationRow {
  email: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  roomInfo: string;
  bookingConfirmation: string;
}

function parseRoomType(raw: string): string {
  if (raw === "35A") return "single";
  if (raw === "55A") return "double";
  return raw.toLowerCase();
}

function extractEmail(contact: string): string | null {
  const match = contact.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0].toLowerCase() : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "No worksheet found" }, { status: 400 });
    }

    const rows: AccommodationRow[] = [];
    const errors: { row: number; message: string }[] = [];

    // Data starts at row 6 (row 5 is header)
    for (let i = 6; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const guestName = String(row.getCell(3).value ?? "").trim();
      if (!guestName) continue;

      const contact = String(row.getCell(11).value ?? "");
      const email = extractEmail(contact);

      if (!email) {
        errors.push({ row: i, message: `No email found for ${guestName}` });
        continue;
      }

      rows.push({
        email,
        checkInDate: String(row.getCell(6).value ?? "").trim(),
        checkOutDate: String(row.getCell(7).value ?? "").trim(),
        roomType: parseRoomType(String(row.getCell(8).value ?? "").trim()),
        roomInfo: String(row.getCell(9).value ?? "").trim(),
        bookingConfirmation: String(row.getCell(10).value ?? "").trim(),
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ errors, imported: 0 }, { status: 400 });
    }

    // Preview mode
    const confirm = formData.get("confirm") === "true";
    if (!confirm) {
      return NextResponse.json({ rows, errors, preview: true });
    }

    // Write to Firestore
    const batch = adminDb.batch();
    const now = new Date().toISOString();
    let imported = 0;

    for (const row of rows) {
      const userRef = adminDb.collection("users").doc(row.email);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        errors.push({ row: 0, message: `User ${row.email} not found in system` });
        continue;
      }

      batch.update(userRef, {
        accommodation: {
          checkInDate: row.checkInDate,
          checkOutDate: row.checkOutDate,
          roomType: row.roomType,
          roomInfo: row.roomInfo,
          bookingConfirmation: row.bookingConfirmation,
        },
        updatedAt: now,
      });
      imported++;
    }

    await batch.commit();

    return NextResponse.json({ imported, errors });
  } catch (error) {
    console.error("Upload accommodation error:", error);
    return NextResponse.json(
      { error: "Failed to process accommodation upload" },
      { status: 500 }
    );
  }
}
