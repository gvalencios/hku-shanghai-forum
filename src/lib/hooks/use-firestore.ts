"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  type Query,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";

export function useFirestoreCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientDb();
    const q: Query<DocumentData> = query(
      collection(db, collectionName),
      ...constraints
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as T)
      );
      setData(items);
      setLoading(false);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading };
}
