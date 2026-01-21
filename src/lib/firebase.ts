import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for auto-on-render project
const firebaseConfig = {
  apiKey: "AIzaSyCxzFjQgFHSJuFQASlY6RAM0IQFTwgIgtU",
  authDomain: "auto-on-render.firebaseapp.com",
  projectId: "auto-on-render",
  storageBucket: "auto-on-render.firebasestorage.app",
  messagingSenderId: "366748385131",
  appId: "1:366748385131:web:f4299712a32da7c874d62e",
  measurementId: "G-S2K83MT8SG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
