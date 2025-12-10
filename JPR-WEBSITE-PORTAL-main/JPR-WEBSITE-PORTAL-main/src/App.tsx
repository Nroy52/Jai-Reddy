import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import Vision from "./pages/Vision";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PillarPage from "./pages/PillarPage";
import Contacts from "./pages/Contacts";
import Vault from "./pages/Vault";
import Tasks from "./pages/Tasks";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Explorer from "./pages/Explorer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Origin lock for https://jaireddy.uk/portal
const ALLOWED_ORIGINS = [
  "https://jaireddy.uk",
  "https://www.jaireddy.uk",
  "http://jaireddy.uk",
  "http://www.jaireddy.uk",
];

const OriginGuard = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const origin = window.location.origin;
    const isDev = import.meta.env.DEV;
    const hostname = new URL(origin).hostname;
    const isVercel = /\.vercel\.app$/.test(hostname);

    if (!isDev && !ALLOWED_ORIGINS.includes(origin) && !isVercel) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;flex-direction:column;gap:1rem;">
          <h1 style="color:#991b1b;font-size:2rem;">Access Denied</h1>
          <p style="color:#666;">This portal is only accessible at <strong>https://jaireddy.uk/portal</strong></p>
        </div>
      `;
    }
  }, []);

  return <>{children}</>;
};

const App = () => {
  // Use /portal in production (Vercel) and / in dev/preview
  const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
  const isJaireddy = currentHost.endsWith("jaireddy.uk");
  const basename = import.meta.env.DEV ? "/" : isJaireddy ? "/portal" : "/";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OriginGuard>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pending" element={<PendingApproval />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/dashboard/pillar/:id" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PillarPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Contacts />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/vault" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Vault />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Tasks />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/messages" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Messages />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                <Route path="/explorer" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Explorer />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </OriginGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
