// fireBaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAhPhRkIQmcPROKlM3CPP_UYKVd4Nc4408",
  authDomain: "fitness-tracker-1d34d.firebaseapp.com",
  projectId: "fitness-tracker-1d34d",
  storageBucket: "fitness-tracker-1d34d.appspot.com",
  messagingSenderId: "764269168688",
  appId: "1:764269168688:web:7e4102cbf6443b0f8585f5",
  measurementId: "G-DMTKMJ68VH"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
