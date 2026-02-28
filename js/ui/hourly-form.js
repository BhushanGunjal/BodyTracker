import { saveSymptomLog } from "../services/logs.js";
import { renderDashboard } from "../core/chart.js";
import { mapDataError } from "../utils/error-mapper.js";

const hourlySubmitBtn = document.getElementById("hourly-submit-btn");
const modalElement = document.getElementById("hourlyModal");

let state = {
    tremor: null,
    stiffness: null,
    movement: null
};

function resetForm() {
    state.tremor = null;
    state.stiffness = null;
    state.movement = null;

    document.querySelectorAll("[data-type]").forEach(btn => {
        btn.classList.remove("active", "btn-secondary");
        btn.classList.add("btn-outline-secondary");
    });
}

function setupFormButtons() {
    document.querySelectorAll("[data-type]").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            const value = btn.dataset.value;
            state[type] = value;

            const group = btn.closest(".btn-group");
            if (!group) return;

            group.querySelectorAll("button").forEach(groupBtn => {
                groupBtn.classList.remove("active", "btn-secondary");
                groupBtn.classList.add("btn-outline-secondary");
            });

            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-secondary", "active");
        });
    });
}

export function initHourlyForm() {
    setupFormButtons();

    if (hourlySubmitBtn) {
        hourlySubmitBtn.addEventListener("click", async () => {
            if (state.tremor === null || state.stiffness === null || state.movement === null) {
                alert("Please complete all fields.");
                return;
            }

            try {
                await saveSymptomLog(state);
                await renderDashboard();
                resetForm();

                const modalInstance = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
                if (modalInstance) {
                    modalInstance.hide();
                }
            } catch (error) {
                alert(mapDataError(error));
            }
        });
    }
}
