import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBK1QqPoOvXzgpSsCAArBxjTpmx77XV9sE",
    authDomain: "tracker-5e51e.firebaseapp.com",
    projectId: "tracker-5e51e",
    storageBucket: "tracker-5e51e.firebasestorage.app",
    messagingSenderId: "404527407352",
    appId: "1:404527407352:web:87931038a6aba1acc15b0d"
};

let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        useFetchStreams: false
    });
    console.log("[firebase] Initialized (auto long-polling enabled)");
} catch (error) {
    console.error("[firebase] Initialization failed", error);
    throw error;
}

export { db };