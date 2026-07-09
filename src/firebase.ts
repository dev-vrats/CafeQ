import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD09oJXU30oYf4BiAIuVHqlNAO8XKUJ-kU",
  authDomain: "cafeq-67d51.firebaseapp.com",
  projectId: "cafeq-67d51",
  storageBucket: "cafeq-67d51.firebasestorage.app",
  messagingSenderId: "937852436873",
  appId: "1:937852436873:web:1606731dcc908ac9216158"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators if running locally (optional, can be toggled via env)
const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === 'true' || false;

if (USE_EMULATOR) {
  // connectAuthEmulator(auth, "http://127.0.0.1:9099"); // If using Auth Emulator
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
