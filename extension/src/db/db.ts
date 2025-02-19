import { firebaseOptions } from "@cb/constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth/web-extension";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseOptions);

const auth = getAuth(app);

const firestore = getFirestore(app);

if (import.meta.env.MODE === "development") {
  // See firebase.json
  const AUTH_URL = "http://localhost:3003";
  connectAuthEmulator(auth, AUTH_URL);
  connectFirestoreEmulator(firestore, "localhost", 3001);
}

export { auth, firestore };
