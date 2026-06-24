import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";

const SETTINGS_COLLECTION = "settings";
const VISIBILITY_DOC = "infoVisibility";

/** Whether the Info Hub is hidden from students. Defaults to false (visible). */
export async function getInfoHubHidden(): Promise<boolean> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, VISIBILITY_DOC));
  if (!snap.exists()) return false;
  return Boolean(snap.data().hidden);
}

export async function setInfoHubHidden(hidden: boolean): Promise<void> {
  const db = getClientDb();
  await setDoc(doc(db, SETTINGS_COLLECTION, VISIBILITY_DOC), { hidden }, { merge: true });
}
