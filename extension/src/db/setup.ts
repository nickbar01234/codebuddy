import { FirebaseOptions, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth/web-extension";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const env = import.meta.env;
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
  // See firebase.json
  connectFirestoreEmulator(firestore, "127.0.0.1", 3001);
  connectAuthEmulator(auth, "http://localhost:3003", { disableWarnings: true });
}
