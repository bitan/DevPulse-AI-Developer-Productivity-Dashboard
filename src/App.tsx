import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const Login     = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects  = lazy(() => import("./pages/Projects"));
const Settings  = lazy(() => import("./pages/Settings"));
const Logs      = lazy(() => import("./pages/Logs"));
const Insights  = lazy(() => import("./pages/Insights"));
const Favorites = lazy(() => import("./pages/Favorites"));
const NotFound  = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/"      element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Protected */}
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/projects"  element={<Protected><Projects /></Protected>} />
                <Route path="/settings"  element={<Protected><Settings /></Protected>} />
                <Route path="/logs"      element={<Protected><Logs /></Protected>} />
                <Route path="/insights"  element={<Protected><Insights /></Protected>} />
                <Route path="/favorites" element={<Protected><Favorites /></Protected>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
