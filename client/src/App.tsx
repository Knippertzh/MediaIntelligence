import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useTranslation } from "react-i18next";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LeadsPage from "@/pages/leads";
import CompaniesPage from "@/pages/companies";
import AuthPage from "@/pages/auth-page";

function Router() {
  // Initialize i18n - this will make translation available throughout the app
  const { t } = useTranslation();
  
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/leads" component={LeadsPage} />
      <ProtectedRoute path="/companies" component={CompaniesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
