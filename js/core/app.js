let state = {
    tremor: null,
    stiffness: null,
    movement: null,
    medicationTaken: false
};

// Generic handler for button groups
function handleSelection(sectionId, key) {
    const section = document.getElementById(sectionId);
    const buttons = section.querySelectorAll("button");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            state[key] = btn.dataset.value;

            // Remove active from all
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

handleSelection("tremor-section", "tremor");
handleSelection("stiffness-section", "stiffness");
handleSelection("movement-section", "movement");

document.getElementById("submit-btn").addEventListener("click", () => {
    console.log({
        ...state,
        timestamp: new Date()
    });
});







// Medication logging
const medicationBtn = document.getElementById("medication-btn");

if (medicationBtn) {
    medicationBtn.addEventListener("click", () => {
        const medicationEvent = {
            type: "medication",
            timestamp: new Date()
        };

        console.log("Medication Logged:", medicationEvent);

        // Optional small visual feedback
        medicationBtn.textContent = "Logged ✓";
        setTimeout(() => {
            medicationBtn.textContent = "Medication Taken Now";
        }, 1500);
    });
}