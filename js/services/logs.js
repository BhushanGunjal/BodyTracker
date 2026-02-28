import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase-init.js";
import { getCurrentUser } from "./auth.js";

// ------------------ WRITE LAYER ------------------

export async function saveSymptomLog(data) {

    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const payload = {
        uid: user.uid,
        tremor: Number(data.tremor),
        stiffness: Number(data.stiffness),
        movement: Number(data.movement),
        timestamp: serverTimestamp()
    };

    try {
        const docRef = await addDoc(
            collection(db, "users", user.uid, "symptomLogs"),
            payload
        );

        return docRef;
    } catch (error) {
        if (error?.code === "permission-denied") {
            const docRef = await addDoc(collection(db, "symptomLogs"), payload);
            return docRef;
        }
        throw error;
    }
}

export async function saveMedicationLog() {

    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const payload = {
        uid: user.uid,
        timestamp: serverTimestamp()
    };

    try {
        const docRef = await addDoc(
            collection(db, "users", user.uid, "medicationLogs"),
            payload
        );

        return docRef;
    } catch (error) {
        if (error?.code === "permission-denied") {
            const docRef = await addDoc(collection(db, "medicationLogs"), payload);
            return docRef;
        }
        throw error;
    }
}

// ------------------ READ LAYER ------------------

export async function fetchSymptomLogs() {

    const user = getCurrentUser();
    if (!user) return [];

    try {
        const q = query(
            collection(db, "users", user.uid, "symptomLogs"),
            orderBy("timestamp", "asc")
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        if (error?.code === "permission-denied") {
            const q = query(
                collection(db, "symptomLogs"),
                orderBy("timestamp", "asc")
            );

            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(log => !log.uid || log.uid === user.uid);
        }
        throw error;
    }
}

export async function fetchMedicationLogs() {

    const user = getCurrentUser();
    if (!user) return [];

    try {
        const q = query(
            collection(db, "users", user.uid, "medicationLogs"),
            orderBy("timestamp", "asc")
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        if (error?.code === "permission-denied") {
            const q = query(
                collection(db, "medicationLogs"),
                orderBy("timestamp", "asc")
            );

            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(log => !log.uid || log.uid === user.uid);
        }
        throw error;
    }
}