
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppInitializer } from "@/components/layout/AppInitializer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Import des pages
import Index from "./pages/Index";
import Stocks from "./pages/Stocks";
import VenteComptoir from "./pages/VenteComptoir";
import Ventes from "./pages/Ventes";
import Achats from "./pages/Achats";
import Clients from "./pages/Clients";
import Caisse from "./pages/Caisse";
import Marges from "./pages/Marges";
import Rapports from "./pages/Rapports";
import Parametres from "./pages/Parametres";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppInitializer>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stocks"
                  element={
                    <ProtectedRoute>
                      <Stocks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vente-comptoir"
                  element={
                    <ProtectedRoute>
                      <VenteComptoir />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventes"
                  element={
                    <ProtectedRoute>
                      <Ventes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achats"
                  element={
                    <ProtectedRoute>
                      <Achats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/caisse"
                  element={
                    <ProtectedRoute>
                      <Caisse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marges"
                  element={
                    <ProtectedRoute>
                      <Marges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rapports"
                  element={
                    <ProtectedRoute>
                      <Rapports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/parametres"
                  element={
                    <ProtectedRoute>
                      <Parametres />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AppInitializer>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
