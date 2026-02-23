import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { InfoCategory } from "@/lib/types/info";

interface SeedBlock {
  title: string;
  body: string;
  category: InfoCategory;
  order: number;
  links: { label: string; url: string }[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const SEED_BLOCKS: SeedBlock[] = [
  // ── Overview ──
  {
    title: "Course Overview",
    body: `We are excited to announce a special intensive delivery of AILT1001-2S Artificial Intelligence Literacy I, to be held during Reading Week of Semester 2 (March 9 to 13, 2026) at our HKU-CDS Teaching and Research Site in Shanghai. Lecture and tutorial content is identical to other subclasses, but condensed into one intensive week. Participants will receive free accommodation and airfare subsidy.`,
    category: "overview",
    order: 0,
    links: [
      { label: "Course Website", url: "https://ailt.cds.hku.hk/ailt1001_2S.html" },
    ],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Course Details",
    body: `Duration: 5 days (March 9 - March 13, 2026) + 2 travel days (March 8 & 14, 2026)
Location: HKU-CDS Teaching and Research Site, Shanghai
Class Size: 100 undergraduate students from any faculty`,
    category: "overview",
    order: 1,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },

  // ── Schedule ──
  {
    title: "Schedule Overview",
    body: `The course runs from Monday, March 9 to Friday, March 13, 2026, with travel days on Sunday, March 8 and Saturday, March 14, 2026.`,
    category: "schedule",
    order: 2,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Day 1 – March 9, 2026 (Monday)",
    body: `09:30–10:00  Orientation | Lecture Hall | 100 students
10:00–12:00  Lectures 1, 2 | Lecture Hall | 100 students
12:00–13:00  Lunch Break
13:00–14:50  Tutorial I (Groups A & B) | Tutorial Rm 1 & 2 | 25 students each
14:50–15:00  Break
15:00–16:50  Tutorial I (Groups C & D) | Tutorial Rm 1 & 2 | 25 students each`,
    category: "schedule",
    order: 3,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Day 2 – March 10, 2026 (Tuesday)",
    body: `09:30–12:00  Lectures 3, 4, 5(I) | Lecture Hall | 100 students
12:00–13:00  Lunch Break
13:00–14:50  Tutorial II (Groups A & B) | Tutorial Rm 1 & 2 | 25 students each
14:50–15:00  Break
15:00–16:50  Tutorial II (Groups C & D) | Tutorial Rm 1 & 2 | 25 students each`,
    category: "schedule",
    order: 4,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Day 3 – March 11, 2026 (Wednesday)",
    body: `09:30–12:00  Lectures 5(II), 6, 7 | Lecture Hall | 100 students
12:00–13:00  Lunch Break
13:00–14:50  Tutorial III (Groups A & B) | Tutorial Rm 1 & 2 | 25 students each
14:50–15:00  Break
15:00–16:50  Tutorial III (Groups C & D) | Tutorial Rm 1 & 2 | 25 students each`,
    category: "schedule",
    order: 5,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Day 4 – March 12, 2026 (Thursday)",
    body: `10:00–12:00  Lectures 8, 9 | Lecture Hall | 100 students
12:00–13:00  Lunch Break
13:00–14:50  Tutorial IV (Groups A & B) | Tutorial Rm 1 & 2 | 25 students each
14:50–15:00  Break
15:00–16:50  Tutorial IV (Groups C & D) | Tutorial Rm 1 & 2 | 25 students each`,
    category: "schedule",
    order: 6,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Day 5 – March 13, 2026 (Friday)",
    body: `10:00–11:00  Lecture 10 | Lecture Hall | 100 students
11:00–13:00  Extended Break
13:00–14:50  Tutorial V (Groups A & B) | Tutorial Rm 1 & 2 | 25 students each
14:50–15:00  Break
15:00–16:50  Tutorial V (Groups C & D) | Tutorial Rm 1 & 2 | 25 students each`,
    category: "schedule",
    order: 7,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },

  // ── Assessment ──
  {
    title: "Course Assessment",
    body: `Assessment methods are the same as regular AILT1001 subclasses. For more details, please refer to the course home page.

- Participation (20%): Tutorials & online activities
- Group Assignment (40%): Mini project
- Final Test (40%): MCQs, short answers, etc.`,
    category: "assessment",
    order: 8,
    links: [
      { label: "Course Home Page", url: "https://ailt.cds.hku.hk/ailt1001.html#assessment" },
    ],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Poster Exhibition & Final Grade",
    body: `Poster Exhibition: Same as the main campus time & location
Final Grade Release: Same as the main campus time`,
    category: "assessment",
    order: 9,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },

  // ── Contacts ──
  {
    title: "Contact Information",
    body: `For questions about AILT1001-2S, please contact:

Email: ailit@hku.hk
Subject Line: AILT1001-2S Inquiry - [Your Student ID]`,
    category: "contacts",
    order: 10,
    links: [
      { label: "ailit@hku.hk", url: "mailto:ailit@hku.hk" },
    ],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },

  // ── Rules ──
  {
    title: "Attendance & Subsidy Policy",
    body: `Full attendance at lectures and tutorials is required to be eligible for the subsidy. If you are unable to attend any session due to illness or other valid reasons, please refer to the sick leave policy on the course home page.`,
    category: "rules",
    order: 11,
    links: [
      { label: "Sick Leave Policy", url: "https://ailt.cds.hku.hk/ailt1001.html#schedule" },
    ],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
];

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    const col = adminDb.collection("infoBlocks");

    // Check if blocks already exist
    const existing = await col.get();
    if (!existing.empty && !force) {
      return NextResponse.json(
        { error: "Info blocks already exist. Use ?force=true to clear and re-seed." },
        { status: 409 }
      );
    }

    // Delete existing blocks if force
    if (!existing.empty) {
      const deleteBatch = adminDb.batch();
      existing.docs.forEach((d) => deleteBatch.delete(d.ref));
      await deleteBatch.commit();
    }

    const now = new Date().toISOString();
    const batch = adminDb.batch();

    for (const block of SEED_BLOCKS) {
      const ref = col.doc();
      batch.set(ref, {
        ...block,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      count: SEED_BLOCKS.length,
      message: `Seeded ${SEED_BLOCKS.length} info blocks.`,
    });
  } catch (error) {
    console.error("Seed info error:", error);
    return NextResponse.json(
      { error: "Failed to seed info blocks" },
      { status: 500 }
    );
  }
}
