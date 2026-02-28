// Error mapping utilities for user-friendly messages

export function mapAuthError(error) {
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

export function mapDataError(error) {
    if (error?.code === "permission-denied") {
        return "Firestore permission denied. Update Firestore Rules to allow authenticated users to read/write their own logs.";
    }

    return error?.message || "Data operation failed.";
}
