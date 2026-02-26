import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase-init.js";

export async function saveSymptomLog(data) {
    const payload = {
        tremor: Number(data.tremor),
        stiffness: Number(data.stiffness),
        movement: Number(data.movement),
        timestamp: serverTimestamp()
    };

    try {
//        console.log("[firebase] saveSymptomLog started", payload);
        const docRef = await addDoc(collection(db, "symptomLogs"), payload);
//        console.log("[firebase] saveSymptomLog success", docRef.id);
        return docRef;
    } catch (error) {
        console.error("[firebase] REAL saveSymptomLog error:", error);
        throw error;
    }
    
}

export async function saveMedicationLog() {
    const payload = {
        timestamp: serverTimestamp()
    };
    try {
//        console.log("[firebase] saveMedicationLog started", payload);
        const docRef = await addDoc(collection(db, "medicationLogs"), payload);
//        console.log("[firebase] saveMedicationLog success", docRef.id);
        return docRef;
    } catch (error) {
        console.error("[firebase] REAL saveMedicationLog error:", error);
        throw error;
    }
}