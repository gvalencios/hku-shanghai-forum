import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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

export async function createStudent(
  email: string,
  data: Partial<UserDocument>
): Promise<void> {
  const db = getClientDb();
  const now = new Date().toISOString();
  const emailKey = email.toLowerCase();

  await setDoc(doc(db, "users", emailKey), {
    authUid: emailKey,
    email: emailKey,
    role: "student",
    familyNameEn: "",
    firstNameEn: "",
    fullChineseName: "",
    gender: "",
    faculty: "",
    studentId: "",
    passportCountry: "",
    hasChinaBankAccount: false,
    telephone: "",
    specialRequest: "",
    flightTicketStatus: "",
    departureFlight: { date: "", time: "", flightNumber: "" },
    arrivalFlight: { date: "", time: "", flightNumber: "" },
    visaStatus: "",
    visaNotes: "",
    emergencyContact: { name: "", relationship: "", phone: "", email: "" },
    dietaryRestrictions: "",
    medicalConditions: "",
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  await setDoc(doc(db, "emailStudentMap", emailKey), {
    email: emailKey,
    familyNameEn: data.familyNameEn ?? "",
    firstNameEn: data.firstNameEn ?? "",
    fullChineseName: data.fullChineseName ?? "",
    gender: data.gender ?? "",
    faculty: data.faculty ?? "",
    studentId: data.studentId ?? "",
    passportCountry: data.passportCountry ?? "",
    hasChinaBankAccount: data.hasChinaBankAccount ?? false,
    telephone: data.telephone ?? "",
    specialRequest: data.specialRequest ?? "",
    updatedAt: now,
  });
}

export async function deleteStudent(email: string): Promise<void> {
  const db = getClientDb();
  const emailKey = email.toLowerCase();
  await deleteDoc(doc(db, "users", emailKey));
  await deleteDoc(doc(db, "emailStudentMap", emailKey));
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
