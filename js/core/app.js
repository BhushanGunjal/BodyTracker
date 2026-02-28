import { saveSymptomLog, saveMedicationLog } from "../services/logs.js";
import { renderDashboard } from "./chart.js";
import { register, login, logout, listenAuthState } from "../services/auth.js";

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

const hourlySubmitBtn = document.getElementById("hourly-submit-btn");
const modalElement = document.getElementById("hourlyModal");
const medicationBtn = document.getElementById("medication-btn");
const hourlyTopBtn = document.getElementById("hourly-top-btn");

let state = {
    tremor: null,
    stiffness: null,
    movement: null
};

function mapAuthError(error) {
    const code = error?.code || "";

    if (code === "auth/invalid-email") return "Invalid email format.";
    if (code === "auth/missing-password") return "Please enter a password.";
    if (code === "auth/weak-password") return "Password must be at least 6 characters.";
    if (code === "auth/email-already-in-use") return "This email is already registered.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        return "Incorrect email or password.";
    }
    if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
    if (code === "auth/network-request-failed") return "Network error. Check internet connection and try again.";
    if (code === "auth/operation-not-allowed") {
        return "Email/Password sign-in is disabled in Firebase Authentication settings.";
    }
    if (code === "auth/configuration-not-found") {
        return "Firebase Authentication config not found for this API key/project. Update firebase config in js/services/firebase-init.js and enable Authentication in Firebase Console.";
    }
    if (code === "auth/unauthorized-domain") {
        return "This domain is not authorized in Firebase Authentication settings.";
    }

    return error?.message || "Authentication failed.";
}

function mapDataError(error) {
    if (error?.code === "permission-denied") {
        return "Firestore permission denied. Update Firestore Rules to allow authenticated users to read/write their own logs.";
    }

    return error?.message || "Data operation failed.";
}

function validateAuthInputs() {
    const email = emailInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
        throw new Error("Please enter both email and password.");
    }

    return { email, password };
}

async function runAuthAction(action) {
    if (!loginBtn || !registerBtn || !emailInput || !passwordInput) return;

    if (window.location.protocol === "file:") {
        alert("Open this app via http://localhost (not file://) for Firebase Auth to work correctly.");
        return;
    }

    loginBtn.disabled = true;
    registerBtn.disabled = true;

    try {
        const { email, password } = validateAuthInputs();
        await action(email, password);
    } catch (error) {
        alert(mapAuthError(error));
    } finally {
        loginBtn.disabled = false;
        registerBtn.disabled = false;
    }
}

if (loginBtn && registerBtn) {
    loginBtn.addEventListener("click", () => runAuthAction(login));
    registerBtn.addEventListener("click", () => runAuthAction(register));
}

listenAuthState(async (user) => {
    if (user) {
        if (authSection) authSection.style.display = "none";
        if (appSection) appSection.style.display = "block";
        if (userEmail) userEmail.textContent = user.email || "Logged in";

        try {
            await renderDashboard();
        } catch (error) {
            console.error("Dashboard render failed:", error);
            alert(mapDataError(error));
        }
        return;
    }

    if (authSection) authSection.style.display = "block";
    if (appSection) appSection.style.display = "none";
    if (userEmail) userEmail.textContent = "";
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await logout();
        } catch (error) {
            alert(error.message || "Failed to logout.");
        }
    });
}

function resetForm() {
    state.tremor = null;
    state.stiffness = null;
    state.movement = null;

    document.querySelectorAll("[data-type]").forEach(btn => {
        btn.classList.remove("active", "btn-secondary");
        btn.classList.add("btn-outline-secondary");
    });
}

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
