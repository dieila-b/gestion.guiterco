
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DevModeToggle } from "@/components/auth/DevModeToggle";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Sales from "./pages/Sales";
import Stocks from "./pages/Stocks";
import Purchases from "./pages/Purchases";
import Clients from "./pages/Clients";
import CashRegisters from "./pages/CashRegisters";
import Margins from "./pages/Margins";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppNotification from "@/components/AppNotification";
import DataRestoredNotification from "@/components/DataRestoredNotification";
import { queryClient } from "@/lib/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <PermissionGuard menu="Dashboard" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé au tableau de bord</p></div>}>
                  <Index />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <PermissionGuard menu="Ventes" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux ventes</p></div>}>
                  <Sales />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/stocks" element={
              <ProtectedRoute>
                <PermissionGuard menu="Stock" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé au stock</p></div>}>
                  <Stocks />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/purchases" element={
              <ProtectedRoute>
                <PermissionGuard menu="Achats" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux achats</p></div>}>
                  <Purchases />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <PermissionGuard menu="Clients" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux clients</p></div>}>
                  <Clients />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/cash-registers" element={
              <ProtectedRoute>
                <PermissionGuard menu="Caisse" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé à la caisse</p></div>}>
                  <CashRegisters />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/margins" element={
              <ProtectedRoute>
                <PermissionGuard menu="Rapports" submenu="Marges" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux marges</p></div>}>
                  <Margins />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <PermissionGuard menu="Rapports" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux rapports</p></div>}>
                  <Reports />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PermissionGuard menu="Paramètres" fallback={<div className="min-h-screen flex items-center justify-center"><p>Accès refusé aux paramètres</p></div>}>
                  <Settings />
                </PermissionGuard>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AppNotification />
          <DataRestoredNotification />
          <DevModeToggle />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
