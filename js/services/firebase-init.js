import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoK9S8N27eStV3aWwYL1xIVuUyLHV2xSw",
    authDomain: "tracker-1ec30.firebaseapp.com",
    projectId: "tracker-1ec30",
    storageBucket: "tracker-1ec30.firebasestorage.app",
    messagingSenderId: "202478898803",
    appId: "1:202478898803:web:51f2ecae7a76eda7942406"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };