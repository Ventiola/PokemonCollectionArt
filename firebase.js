// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCUG7fHwkjGBwwD_5g-ojMbTSQHVzSWayI",
  authDomain: "pokemonartcollection-ef4a6.firebaseapp.com",
  projectId: "pokemonartcollection-ef4a6",
  storageBucket: "pokemonartcollection-ef4a6.firebasestorage.app",
  messagingSenderId: "681280606089",
  appId: "1:681280606089:web:ed41daa1b572fde5325b58",
  measurementId: "G-7NDFBN0B20"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore
const db = getFirestore(app);

// Ekspor supaya bisa dipakai di script.js
export { db };
