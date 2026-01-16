// app/firebase/auth.ts
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Define allowed user roles
export type UserRole = "patient" | "doctor" | "staff" | "admin";

// Register with email & password
export const registerWithEmail = async (
  fullName: string,
  email: string,
  password: string,
  mobile: string,
  role: UserRole
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName: fullName });

  // Save additional info to Firestore
  await setDoc(doc(db, "users", user.uid), {
    fullName,
    email,
    mobile,
    role,
    createdAt: new Date(),
  });

  return user;
};

// Login with email & password
export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

// Google Sign-In with role
export const signInWithGoogle = async (role: UserRole) => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      fullName: user.displayName,
      email: user.email,
      mobile: "",
      role,
      createdAt: new Date(),
    },
    { merge: true }
  );

  return user;
};

// Logout
export const logout = async () => {
  await auth.signOut();
};
