import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, type Auth, type UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export const isFirebaseEnabled = (): boolean => hasFirebaseConfig;

export const firebaseSignIn = async (
  email: string,
  password: string,
): Promise<UserCredential | null> => {
  if (!auth) return null;
  return signInWithEmailAndPassword(auth, email, password);
};

export const firebaseGetIdToken = async (): Promise<string | null> => {
  if (!auth?.currentUser) return null;
  return auth.currentUser.getIdToken();
};

export const firebaseLogout = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};

export { app as firebaseApp, auth as firebaseAuth };