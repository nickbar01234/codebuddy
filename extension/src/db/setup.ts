import { FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const env = (import.meta as any).env;
const DEV_VALUE = "demo-code-buddy-development";

export const firebaseOptions: FirebaseOptions =
  env.MODE === "development"
    ? {
        apiKey: DEV_VALUE,
        authDomain: DEV_VALUE,
        projectId: DEV_VALUE,
        storageBucket: DEV_VALUE,
        messagingSenderId: DEV_VALUE,
        appId: DEV_VALUE,
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
