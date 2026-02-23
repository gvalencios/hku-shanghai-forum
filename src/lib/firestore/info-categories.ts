import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { DEFAULT_CATEGORIES, type InfoCategoryDef } from "@/lib/types/info";

const SETTINGS_COLLECTION = "settings";
const CATEGORIES_DOC = "infoCategories";

export async function getInfoCategories(): Promise<InfoCategoryDef[]> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC));
  if (!snap.exists()) return DEFAULT_CATEGORIES;
  return (snap.data().categories ?? DEFAULT_CATEGORIES) as InfoCategoryDef[];
}

export async function saveInfoCategories(categories: InfoCategoryDef[]): Promise<void> {
  const db = getClientDb();
  await setDoc(doc(db, SETTINGS_COLLECTION, CATEGORIES_DOC), { categories });
}
