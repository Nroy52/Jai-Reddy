import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSeedData } from "./lib/seed";

// Initialize seed data on app startup
initializeSeedData();
createRoot(document.getElementById("root")!).render(
    <App />
);
