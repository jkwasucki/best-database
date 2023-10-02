// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDalBQm1s6GRcO-kauHDA2zjo6gKCUThSA",
  authDomain: "database-44bac.firebaseapp.com",
  projectId: "database-44bac",
  storageBucket: "database-44bac.appspot.com",
  messagingSenderId: "582811087648",
  appId: "1:582811087648:web:bed29e5d0a023dffee5d45",
  measurementId: "G-JKQSVRNCE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
