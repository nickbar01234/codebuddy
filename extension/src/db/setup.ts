import { FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import {} from "@cb/db/converter";
import { getAuth } from "firebase/auth";

const env = (import.meta as any).env;
const devValue = "demo-code-buddy-development";

export const firebaseOptions: FirebaseOptions =
  env.MODE === "development"
    ? {
        apiKey: devValue,
        authDomain: devValue,
        projectId: devValue,
        storageBucket: devValue,
        messagingSenderId: devValue,
        appId: devValue,
      }
    : {
        apiKey: env.VITE_API_KEY,
        authDomain: env.VITE_AUTH_DOMAIN,
        projectId: env.VITE_PROJECT_ID,
        storageBucket: env.VITE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
        appId: env.VITE_APP_ID,
      };

const app = initializeApp(firebaseOptions);

export const auth = getAuth(app);

export const firestore = getFirestore(app);

if (env.MODE === "development") {
  connectFirestoreEmulator(firestore, "localhost", 3001);
}
