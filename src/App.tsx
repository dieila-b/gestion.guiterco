
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppInitializer } from "@/components/layout/AppInitializer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import des pages
import Index from "./pages/Index";
import Stocks from "./pages/Stocks";
import Sales from "./pages/Sales";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import VenteComptoir from "./pages/VenteComptoir";
import Ventes from "./pages/Ventes";
import Achats from "./pages/Achats";
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
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ventes"
                  element={
                    <ProtectedRoute>
                      <Sales />
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
                  path="/parametres"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                {/* Redirection par défaut pour les pages manquantes */}
                <Route path="/achats" element={<Navigate to="/" replace />} />
                <Route path="/caisse" element={<Navigate to="/" replace />} />
                <Route path="/marges" element={<Navigate to="/" replace />} />
                <Route path="/rapports" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AppInitializer>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
