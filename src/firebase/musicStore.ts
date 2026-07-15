import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config";

export interface SongMeta {
  docId: string;
  id: string;
  name: string;
  createdAt: number;
}

export async function saveSongMeta(userId: string, id: string, name: string) {
  const docRef = await addDoc(collection(db, "songs"), { userId, id, name, createdAt: Date.now() });
  return docRef.id;
}

export async function loadSongMeta(userId: string): Promise<SongMeta[]> {
  const q = query(collection(db, "songs"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ docId: d.id, ...(d.data() as Omit<SongMeta, "docId">) }))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteSongMeta(docId: string) {
  await deleteDoc(doc(db, "songs", docId));
}