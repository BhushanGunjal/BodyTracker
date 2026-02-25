import { saveSymptomLog, saveMedicationLog } from "../services/logs.js";

let state = {
    tremor: null,
    stiffness: null,
    movement: null
};

// Generic handler for button groups
function handleSelection(sectionId, key) {
    const section = document.getElementById(sectionId);
    if (!section) {
        console.error(`[init] Missing section: #${sectionId}`);
        return;
    }

    const buttons = section.querySelectorAll("button");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            state[key] = btn.dataset.value;

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

handleSelection("tremor-section", "tremor");
handleSelection("stiffness-section", "stiffness");
handleSelection("movement-section", "movement");
console.log("[init] App initialized");

function resetForm() {
    state.tremor = null;
    state.stiffness = null;
    state.movement = null;

    document.querySelectorAll(".active").forEach(btn => {
        btn.classList.remove("active");
    });
}

const submitBtn = document.getElementById("submit-btn");

if (!submitBtn) {
    console.error("[init] Missing submit button: #submit-btn");
} else {
    submitBtn.addEventListener("click", async () => {
//    console.log("[ui] Submit clicked", { ...state });

    if (state.tremor === null || state.stiffness === null || state.movement === null) {
        alert("Please complete all fields.");
        return;
    }

    try {
        const docRef = await saveSymptomLog(state);
//        console.log("[save] Symptom log saved", docRef.id, {
//            ...state,
//            timestamp: new Date()
//        });
        resetForm();
    } catch (error) {
        console.error("Error saving symptom log:", error);
        alert(`Failed to save symptom log: ${error.message || error}`);
    }
    });
}

// Medication logging
const medicationBtn = document.getElementById("medication-btn");

if (medicationBtn) {
    medicationBtn.addEventListener("click", async () => {
        console.log("[ui] Medication clicked");
        try {
            const docRef = await saveMedicationLog();
//            console.log("[save] Medication log saved", docRef.id);
            medicationBtn.textContent = "Logged ✓";
            setTimeout(() => {
                medicationBtn.textContent = "Medication Taken Now";
            }, 1500);

        } catch (error) {
            console.error("Error logging medication:", error);
            alert(`Failed to save medication log: ${error.message || error}`);
        }
    });
} else {
    console.error("[init] Missing medication button: #medication-btn");
}


