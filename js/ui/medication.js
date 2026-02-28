import { saveMedicationLog } from "../services/logs.js";
import { renderDashboard } from "../core/chart.js";
import { mapDataError } from "../utils/error-mapper.js";

const medicationBtn = document.getElementById("medication-btn");
const hourlyTopBtn = document.getElementById("hourly-top-btn");

function setActiveTopButton(activeBtn) {
    [medicationBtn, hourlyTopBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline-primary");
    });

    if (!activeBtn) return;
    activeBtn.classList.remove("btn-outline-primary");
    activeBtn.classList.add("btn-primary");
}

export function initMedicationButton() {
    if (medicationBtn) {
        medicationBtn.addEventListener("click", async () => {
            try {
                await saveMedicationLog();
                await renderDashboard();

                medicationBtn.textContent = "Logged ✓";
                setTimeout(() => {
                    medicationBtn.textContent = "Medication Log";
                }, 1500);
            } catch (error) {
                alert(mapDataError(error));
            }
        });
    }

    if (hourlyTopBtn) {
        hourlyTopBtn.addEventListener("click", () => {
            setActiveTopButton(hourlyTopBtn);
        });
    }
}
