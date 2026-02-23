import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { InfoBlock } from "@/lib/types/info";

const COLLECTION = "infoBlocks";

export async function getAllInfoBlocks(): Promise<InfoBlock[]> {
  const db = getClientDb();
  const q = query(collection(db, COLLECTION), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InfoBlock));
}

export async function getPublishedInfoBlocks(): Promise<InfoBlock[]> {
  const db = getClientDb();
  const q = query(
    collection(db, COLLECTION),
    where("isPublished", "==", true),
    orderBy("order")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as InfoBlock));
}

export async function createInfoBlock(data: Omit<InfoBlock, "id">): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateInfoBlock(id: string, data: Partial<InfoBlock>): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteInfoBlock(id: string): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function reorderInfoBlocks(orderedIds: string[]): Promise<void> {
  const db = getClientDb();
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, COLLECTION, id), { order: index });
  });
  await batch.commit();
}
