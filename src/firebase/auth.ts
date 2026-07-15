import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, firebaseConfig } from "./config";

export const signUp = async (name: string, email: string, password: string) => {
  const tempApp = initializeApp(firebaseConfig, `temp-${Date.now()}`);
  const tempAuth = getAuth(tempApp);
  try {
    const cred = await createUserWithEmailAndPassword(tempAuth, email, password);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=d97706&color=1c1917&bold=true`;
    await updateProfile(cred.user, { displayName: name, photoURL: avatarUrl });
  } finally {
    await signOut(tempAuth).catch(() => {});
    await deleteApp(tempApp).catch(() => {});
  }
};

export const logIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider());

export const logOut = () => signOut(auth);

export const watchAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);