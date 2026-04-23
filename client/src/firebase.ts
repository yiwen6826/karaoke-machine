// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9fAPorijSyaPrUg4qa3iifIedqtO0SlM",
  authDomain: "karaoke-machine-3a3a4.firebaseapp.com",
  projectId: "karaoke-machine-3a3a4",
  storageBucket: "karaoke-machine-3a3a4.firebasestorage.app",
  messagingSenderId: "627172251106",
  appId: "1:627172251106:web:798ae6c594e620ac5f15bb",
  measurementId: "G-7SF3L5KHY6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);