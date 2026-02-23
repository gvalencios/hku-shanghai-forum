import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { Report, Reply } from "@/lib/types/report";

const COLLECTION = "reports";

export async function getReportById(id: string): Promise<Report | null> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Report;
}

export async function getReportsByStudent(studentId: string): Promise<Report[]> {
  const db = getClientDb();
  const q = query(
    collection(db, COLLECTION),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function getAllReports(): Promise<Report[]> {
  const db = getClientDb();
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function createReport(data: Omit<Report, "id">): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateReport(id: string, data: Partial<Report>): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// Replies subcollection
export async function getReplies(reportId: string): Promise<Reply[]> {
  const db = getClientDb();
  const q = query(
    collection(db, COLLECTION, reportId, "replies"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply));
}

export async function addReply(reportId: string, data: Omit<Reply, "id">): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION, reportId, "replies"), data);
  return ref.id;
}
