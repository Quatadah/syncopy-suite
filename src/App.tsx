import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SEOPerformanceMonitor from "@/components/SEOPerformanceMonitor";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BoardProvider } from "./contexts/BoardContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorkspaceProvider>
      <BoardProvider>
        <AuthProvider>
          <AccessibilityEnhancer />
          <SEOPerformanceMonitor />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </BoardProvider>
    </WorkspaceProvider>
  </QueryClientProvider>
);

export default App;
