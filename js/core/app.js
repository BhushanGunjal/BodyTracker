// Main application initialization
// Orchestrates all UI modules and initializes the app

import { initAuthForm } from "../ui/auth-form.js";
import { initHourlyForm } from "../ui/hourly-form.js";
import { initMedicationButton } from "../ui/medication.js";

// Initialize all modules
initAuthForm();
initHourlyForm();
initMedicationButton();

