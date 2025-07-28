// Configuração do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBafwXpCK_B2fbvk7s_KbvdHGSzmRkkZZg",
  authDomain: "crm-pingdesk.firebaseapp.com",
  projectId: "crm-pingdesk",
  storageBucket: "crm-pingdesk.firebasestorage.app",
  messagingSenderId: "570359959984",
  appId: "1:570359959984:web:dc701b0f70b806cef3c675",
  measurementId: "G-6MFECLNEHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
