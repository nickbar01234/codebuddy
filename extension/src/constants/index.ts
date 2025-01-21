import { ExtensionStorage } from "@cb/types";
import { FirebaseOptions } from "firebase/app";

// todo(nickbar01234): Small hack since background.ts file can't recognize client-side env
const env = (import.meta as any).env;

export const CodeBuddyPreference: ExtensionStorage = {
  appPreference: {
    width: env.MODE === "development" ? 600 : 300 /* px */,
    isCollapsed: false,
  },
  codePreference: {
    height: 500,
  },
};

export const firebaseOptions: FirebaseOptions = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
};
