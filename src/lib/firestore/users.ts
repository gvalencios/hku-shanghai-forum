import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { UserDocument } from "@/lib/types/user";

export async function getUserById(uid: string): Promise<UserDocument | null> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDocument;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserDocument>
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function getAllStudents(): Promise<(UserDocument & { id: string })[]> {
  const db = getClientDb();
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    orderBy("familyNameEn")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserDocument & { id: string }));
}
