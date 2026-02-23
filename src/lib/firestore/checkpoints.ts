import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { Checkpoint } from "@/lib/types/checkpoint";

const COLLECTION = "checkpoints";

export async function getAllCheckpoints(): Promise<Checkpoint[]> {
  const db = getClientDb();
  const q = query(collection(db, COLLECTION), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Checkpoint));
}

export async function createCheckpoint(
  data: Omit<Checkpoint, "id">
): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateCheckpoint(
  id: string,
  data: Partial<Checkpoint>
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCheckpoint(id: string): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function batchUpdateCheckpointOrders(
  updates: { id: string; order: number }[]
): Promise<void> {
  const db = getClientDb();
  const batch = writeBatch(db);
  updates.forEach(({ id, order }) => {
    batch.update(doc(db, COLLECTION, id), { order });
  });
  await batch.commit();
}
