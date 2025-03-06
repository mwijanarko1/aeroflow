'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGxw-Tvx1SVPJJ6DjWt1Ju0_u6c18Y9jo",
  authDomain: "aeroflow-25416.firebaseapp.com",
  projectId: "aeroflow-25416",
  storageBucket: "aeroflow-25416.firebasestorage.app",
  messagingSenderId: "1082220202500",
  appId: "1:1082220202500:web:2cff4063f5fad5be544351",
  measurementId: "G-7L24L8Q8GF"
};

// Initialize Firebase only if it hasn't been initialized already
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let analytics = null;

// Initialize auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

// Initialize analytics only on the client side
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, googleProvider, db }; 