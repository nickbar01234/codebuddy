import { firebaseOptions } from "@cb/constants";
import { getLocalStorage } from "@cb/services";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseOptions);

const auth = getAuth(app);

const firestore = getFirestore(app);

if (import.meta.env.MODE === "development") {
  // See firebase.json
  const BASE_URL = getLocalStorage("firebaseURL") ?? "http://127.0.0.1:9099";
  console.log("Using Firebase Emulator at", BASE_URL);
  const AUTH_URL = `${BASE_URL}`;
  connectAuthEmulator(auth, AUTH_URL);
}

export { auth, firestore };
