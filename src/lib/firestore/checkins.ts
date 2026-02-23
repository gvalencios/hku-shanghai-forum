import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { Checkin } from "@/lib/types/checkpoint";

const COLLECTION = "checkins";

export async function getCheckinsByUser(userId: string): Promise<Checkin[]> {
  const db = getClientDb();
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Checkin));
}

export async function getAllCheckins(): Promise<Checkin[]> {
  const db = getClientDb();
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Checkin));
}

export async function createCheckin(
  data: Omit<Checkin, "id">
): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function deleteCheckin(id: string): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function hasCheckedIn(
  userId: string,
  checkpointId: string,
  recurringDate?: string
): Promise<boolean> {
  const db = getClientDb();
  let q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("checkpointId", "==", checkpointId)
  );

  if (recurringDate) {
    q = query(q, where("recurringDate", "==", recurringDate));
  }

  const snap = await getDocs(q);
  return !snap.empty;
}
