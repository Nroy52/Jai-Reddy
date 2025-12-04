import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSeedData } from "./lib/seed";

import { ClerkProvider } from '@clerk/clerk-react'

// Initialize seed data on app startup
initializeSeedData();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById("root")!).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
    </ClerkProvider>
);
