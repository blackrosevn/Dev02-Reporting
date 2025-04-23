import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "@/pages/index";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Reports from "@/pages/reports";
import CreateReport from "@/pages/reports/create";
import ReportTemplates from "@/pages/reports/templates";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/reports/create">
        <ProtectedRoute>
          <CreateReport />
        </ProtectedRoute>
      </Route>
      <Route path="/reports/templates">
        <ProtectedRoute roles={[UserRole.ADMIN, UserRole.DEPARTMENT]}>
          <ReportTemplates />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute roles={[UserRole.ADMIN]}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute roles={[UserRole.ADMIN]}>
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
