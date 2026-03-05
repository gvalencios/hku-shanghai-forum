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
    body: `AILT1001-2S is a special intensive delivery of AI Literacy I, held during Reading Week of Semester 2 (March 9–13, 2026) at the HKU-CDS Teaching and Research Site in Shanghai. Lecture and tutorial content is identical to other subclasses, condensed into one intensive week. Participants receive free accommodation and airfare subsidy.`,
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
    body: `Duration: 5 days (March 9–13, 2026) + 2 travel days (March 8 & 14, 2026)
Location: HKU-CDS Teaching and Research Site, Shanghai (CDS-1)
Class Size: 100 undergraduate students from any faculty
Grading: Pass (P), Fail (F), or Distinction (DI) — no GPA impact`,
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
    body: `The course runs Monday March 9 to Friday March 13, 2026, with travel days on Sunday March 8 and Saturday March 14, 2026.

Venues:
• Lectures: Room 2A, 2/F, CDS-1
• Tutorials (Groups A & C): Room 611, CDS-1
• Tutorials (Groups B & D): Room 612, CDS-1`,
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
    body: `09:30–10:00  Orientation | Room 2A, 2/F, CDS-1
10:00–12:00  L_1, L_2 | Room 2A, 2/F, CDS-1
12:30–14:30  Lunch Gathering & Campus Tour
14:30–15:20  Tutorial I – Groups A & B | 611 & 612, CDS-1
15:30–16:20  Tutorial I – Groups C & D | 611 & 612, CDS-1`,
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
    body: `09:30–12:00  L_3, L_4, L_5(I) | Room 2A, 2/F, CDS-1
12:00–13:00  Lunch Break
13:00–14:50  Tutorial II – Groups A & B | 611 & 612, CDS-1
15:00–16:50  Tutorial II – Groups C & D | 611 & 612, CDS-1`,
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
    body: `09:30–12:00  L_5(II), L_6, L_7 | Room 2A, 2/F, CDS-1
12:00–13:00  Lunch Break
13:00–14:50  Tutorial III – Groups A & B | 611 & 612, CDS-1
15:00–16:50  Tutorial III – Groups C & D | 611 & 612, CDS-1`,
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
    body: `10:00–12:00  L_8, L_9 | Room 2A, 2/F, CDS-1
12:00–13:00  Lunch Break
13:00–14:50  Tutorial IV – Groups A & B | 611 & 612, CDS-1
15:00–16:50  Tutorial IV – Groups C & D | 611 & 612, CDS-1`,
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
    body: `10:00–11:00  L_10 – Final Test | Room 2A, 2/F, CDS-1
11:20–12:30  A Slice of Happy Friday @ CDS SH
12:30–13:30  Lunch Break
13:30–13:55  Tutorial V – Group A | Room 611, CDS-1
14:00–14:25  Tutorial V – Group B | Room 611, CDS-1
14:30–14:55  Tutorial V – Group C | Room 611, CDS-1
15:00–15:25  Tutorial V – Group D | Room 611, CDS-1`,
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
    title: "Assessment Overview",
    body: `Students receive Pass (P), Fail (F), or Distinction (DI) — no GPA impact.

Component weights:
• Participation (20%): Tutorial attendance (10%) + Mastery Checks (10%)
• Group Assignment (40%): Self-proposed mini project (A0 poster)
• Final Test (40%): Closed-book online test

Pass (P): ≥ 50% overall AND non-zero score in both final test and group assignment
Distinction (DI): ≥ 90% overall AND excellent group assignment, good attendance & strong participation`,
    category: "assessment",
    order: 8,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Tutorial Attendance (10%)",
    body: `Grading tiers:

Tier 1 – Active Contribution (full marks):
Attends the session, contributes constructively to discussions, actively participates in group activities and problem-solving, and helps advance the discussion meaningfully.

Tier 2 – Passive or Limited Engagement (partial marks):
Attends the session but makes little or no contribution to discussions, or contributions are minimal, off-topic, or do not add value.

Tier 3 – No Contribution (zero):
Does not attend the tutorial session.`,
    category: "assessment",
    order: 9,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Mastery Checks (10%)",
    body: `Access: ED → Lessons (top-right corner)

Release: All Mastery Checks released at 11:59 AM on March 9 (Monday)
Deadline: All Mastery Checks due at 20:59 on March 12 (Thursday)

• Unlimited attempts before the deadline
• Correct answers released AFTER the deadline`,
    category: "assessment",
    order: 10,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Group Project (40%)",
    body: `Create an A0-sized poster on "AI and its Applications" in a group of 5 students. Groups are randomly assigned in Tutorial I.

Choose a specific field or domain and explore how AI is or can potentially be applied within that area. Analyse impact, limitations, risks, and broader implications — supported by evidence.

Rubric breakdown:
• Scope & Depth of Content (10%)
• Originality & Creativity (5%)
• Graphics or Pictures (5%)
• Design & Layout (5%)
• Presentation — Delivery & Engagement (15%)`,
    category: "assessment",
    order: 11,
    links: [],
    isPublished: true,
    createdAt: "",
    updatedAt: "",
    createdBy: "seed",
  },
  {
    title: "Final Test (40%)",
    body: `Date: Friday, March 13, 2026 | 10:00–11:00 AM
Location: Room 2A, 2/F, CDS-1 (Lecture Hall)
Format: Online, closed-book

Possible question types:
• Multiple-Answer Questions
• Ranked Choice Questions
• Elimination-Type Multiple-Choice Questions
• Short Answer Questions`,
    category: "assessment",
    order: 12,
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
Subject Line: AILT1001-2S Inquiry – [Your Student ID]`,
    category: "contacts",
    order: 13,
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
    body: `Full attendance at all lectures and tutorials is required to be eligible for the accommodation and airfare subsidy. If you are unable to attend any session due to illness or other valid reasons, please contact your TA and refer to the sick leave policy on the course home page.`,
    category: "rules",
    order: 14,
    links: [
      { label: "Course Home Page", url: "https://ailt.cds.hku.hk/ailt1001_2S.html" },
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
