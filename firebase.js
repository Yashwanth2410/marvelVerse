// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

/**
 * [IMPORTANT] Replace the following configuration with your own Firebase project credentials.
 * You can find this in your Firebase Console: Project Settings > General > Your apps.
 */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIlMGn4v_7NV3phWahvEEmTQvZfDZzMZE",
  authDomain: "marvelverse-db601.firebaseapp.com",
  projectId: "marvelverse-db601",
  storageBucket: "marvelverse-db601.firebasestorage.app",
  messagingSenderId: "273338829288",
  appId: "1:273338829288:web:64b991b28ed080ea193c5d",
  measurementId: "G-XXJ9BJTRHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
};
