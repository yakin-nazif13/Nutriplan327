import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_o-fZUqmuU2yGNp6RdG1B1MkYcznnEjs",
  authDomain: "nutriplan-cse327.firebaseapp.com",
  projectId: "nutriplan-cse327",
  storageBucket: "nutriplan-cse327.firebasestorage.app",
  messagingSenderId: "474742365435",
  appId: "1:474742365435:web:b9cf03d5f411c23fb2a45e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);