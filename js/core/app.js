import { saveSymptomLog, saveMedicationLog } from "../services/logs.js";
import { renderDashboard } from "./chart.js";

let state = {
    tremor: null,
    stiffness: null,
    movement: null
};


// -----------------------------
// Button Selection (Bootstrap)
// -----------------------------

document.querySelectorAll("[data-type]").forEach(btn => {
    btn.addEventListener("click", () => {

        const type = btn.dataset.type;
        const value = btn.dataset.value;

        state[type] = value;

        const group = btn.closest(".btn-group");
        const groupButtons = group.querySelectorAll("button");

        groupButtons.forEach(b => {
            b.classList.remove("active", "btn-secondary");
            b.classList.add("btn-outline-secondary");
        });

        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-secondary", "active");
    });
});



// -----------------------------
// Reset Form
// -----------------------------

function resetForm() {
    state.tremor = null;
    state.stiffness = null;
    state.movement = null;

    document.querySelectorAll("[data-type]").forEach(btn => {
        btn.classList.remove("active", "btn-secondary");
        btn.classList.add("btn-outline-secondary");
    });
}



// -----------------------------
// Hourly Submit
// -----------------------------

const hourlySubmitBtn = document.getElementById("hourly-submit-btn");
const modalElement = document.getElementById("hourlyModal");

hourlySubmitBtn.addEventListener("click", async () => {

    if (state.tremor === null || state.stiffness === null || state.movement === null) {
        alert("Please complete all fields.");
        return;
    }

    try {
        await saveSymptomLog(state);
        await renderDashboard();
        resetForm();

        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

    } catch (error) {
        console.error("Error saving symptom log:", error);
        alert(`Failed to save symptom log: ${error.message || error}`);
    }
});

// -----------------------------
// Medication Logging
// -----------------------------

const medicationBtn = document.getElementById("medication-btn");
const hourlyTopBtn = document.getElementById("hourly-top-btn");

function setActiveTopButton(activeBtn) {
    [medicationBtn, hourlyTopBtn].forEach(btn => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline-primary");
    });

    activeBtn.classList.remove("btn-outline-primary");
    activeBtn.classList.add("btn-primary");
}

medicationBtn.addEventListener("click", async () => {

    try {
        await saveMedicationLog();
        await renderDashboard();
        medicationBtn.textContent = "Logged ✓";

        setTimeout(() => {
            medicationBtn.textContent = "Medication Log";
        }, 1500);

    } catch (error) {
        console.error("Error logging medication:", error);
        alert(`Failed to save medication log: ${error.message || error}`);
    }
});

// Hourly click
hourlyTopBtn.addEventListener("click", () => {
    setActiveTopButton(hourlyTopBtn);
});



renderDashboard();
