import { register, login, logout, listenAuthState } from "../services/auth.js";
import { renderDashboard } from "../core/chart.js";
import { mapAuthError, mapDataError } from "../utils/error-mapper.js";

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

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

export function initAuthForm() {
    if (loginBtn && registerBtn) {
        loginBtn.addEventListener("click", () => runAuthAction(login));
        registerBtn.addEventListener("click", () => runAuthAction(register));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await logout();
            } catch (error) {
                alert(error.message || "Failed to logout.");
            }
        });
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
}
