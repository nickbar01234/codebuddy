import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth/web-extension";
import {
  connectFirestoreEmulator,
  Firestore,
  getFirestore,
} from "firebase/firestore";

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

export class FirebaseConnection {
  private static instance: FirebaseConnection | null = null;
  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;

  private constructor() {
    this.app = initializeApp(firebaseOptions);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    if (env.MODE === "development") {
      // See firebase.json
      connectFirestoreEmulator(this.firestore, "localhost", 3001);
      connectAuthEmulator(this.auth, "http://localhost:3003");
    }
  }

  private static getInstance(): FirebaseConnection {
    if (this.instance === null) {
      this.instance = new FirebaseConnection();
    }
    return this.instance;
  }

  public static getApp() {
    return this.getInstance().app;
  }

  public static getFirebaseAuth() {
    return this.getInstance().auth;
  }

  public static getFirebaseFirestore() {
    return this.getInstance().firestore;
  }
}
