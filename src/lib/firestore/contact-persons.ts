import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { ContactPerson } from "@/lib/types/report";

const COLLECTION = "contactPersons";

export async function getAllContactPersons(): Promise<ContactPerson[]> {
  const db = getClientDb();
  const q = query(collection(db, COLLECTION), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactPerson));
}

export async function createContactPerson(data: Omit<ContactPerson, "id">): Promise<string> {
  const db = getClientDb();
  const ref = await addDoc(collection(db, COLLECTION), data);
  return ref.id;
}

export async function updateContactPerson(id: string, data: Partial<ContactPerson>): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteContactPerson(id: string): Promise<void> {
  const db = getClientDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
