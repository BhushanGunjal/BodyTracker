import { collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase-init.js";

function withTimeout(promise, ms, operationName) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`${operationName} timed out after ${ms}ms`));
        }, ms);
    });

    return Promise.race([
        promise.finally(() => clearTimeout(timeoutId)),
        timeoutPromise
    ]);
}

export async function saveSymptomLog(data) {
    const payload = {
        tremor: Number(data.tremor),
        stiffness: Number(data.stiffness),
        movement: data.movement,
        timestamp: serverTimestamp()
    };

    try {
        console.log("[firebase] saveSymptomLog started", payload);
        const docRef = await withTimeout(
            addDoc(collection(db, "symptomLogs"), payload),
            12000,
            "saveSymptomLog"
        );
        console.log("[firebase] saveSymptomLog success", docRef.id);
        return docRef;
    } catch (error) {
        console.error("[firebase] saveSymptomLog failed", {
            code: error?.code,
            message: error?.message,
            payload
        });
        throw error;
    }
}

export async function saveMedicationLog() {
    const payload = {
        timestamp: serverTimestamp()
    };
    try {
        console.log("[firebase] saveMedicationLog started", payload);
        const docRef = await withTimeout(
            addDoc(collection(db, "medicationLogs"), payload),
            12000,
            "saveMedicationLog"
        );
        console.log("[firebase] saveMedicationLog success", docRef.id);
        return docRef;
    } catch (error) {
        console.error("[firebase] saveMedicationLog failed", {
            code: error?.code,
            message: error?.message,
            payload
        });
        throw error;
    }
}