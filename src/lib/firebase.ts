// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "oakville-home-seller-success",
  appId: "1:737891637177:web:df5b621fbcd855891bc868",
  storageBucket: "oakville-home-seller-success.firebasestorage.app",
  apiKey: "AIzaSyD7q8JzEzYghyrpH88Ta2xymAPNOUCbZho",
  authDomain: "oakville-home-seller-success.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "737891637177"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
