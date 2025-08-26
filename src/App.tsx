
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppInitializer } from '@/components/layout/AppInitializer';
import { queryClient } from '@/lib/queryClient';

// Import existing pages
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Stocks from './pages/Stocks';
import Clients from './pages/Clients';

// Create simple redirects for missing pages
const VenteComptoir = () => <Sales />;
const Ventes = () => <Sales />;
const Achats = () => <div className="p-4">Module Achats - En développement</div>;
const Caisse = () => <div className="p-4">Module Caisse - En développement</div>;
const Marges = () => <div className="p-4">Module Marges - En développement</div>;
const Rapports = () => <div className="p-4">Module Rapports - En développement</div>;
const Parametres = () => <div className="p-4">Module Paramètres - En développement</div>;

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInitializer>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<div>Page d'authentification</div>} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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
                  path="/stocks"
                  element={
                    <ProtectedRoute>
                      <Stocks />
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
                <Route
                  path="/clients"
                  element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AppInitializer>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;
