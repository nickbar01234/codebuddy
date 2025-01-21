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
  apiKey: "AIzaSyBDu1Q1vQVi1x6U0GfWXIFmohb32jIhKjY",
  authDomain: "codebuddy-1b0dc.firebaseapp.com",
  projectId: "codebuddy-1b0dc",
  storageBucket: "codebuddy-1b0dc.firebasestorage.app",
  messagingSenderId: "871987263347",
  appId: "1:871987263347:web:cb21306ac3d48eb4e5b706",
  measurementId: "G-64K0SVBGFK",
};
