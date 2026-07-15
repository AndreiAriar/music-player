import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAF-KSsWGvrscGcT4KMdS4Y1osiofCyL9U",
  authDomain: "music-player-86ff9.firebaseapp.com",
  projectId: "music-player-86ff9",
  storageBucket: "music-player-86ff9.firebasestorage.app",
  messagingSenderId: "745838302781",
  appId: "1:745838302781:web:01349b001ffdd5d4593c54",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);