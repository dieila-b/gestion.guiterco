
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthPage } from '@/pages/auth/AuthPage';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { Catalogue } from '@/pages/Catalogue';
import { Clients } from '@/pages/Clients';
import { Ventes } from '@/pages/Ventes';
import { Stock } from '@/pages/Stock';
import { Achats } from '@/pages/Achats';
import { Caisse } from '@/pages/Caisse';
import { Marges } from '@/pages/Marges';
import { Rapports } from '@/pages/Rapports';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/components/AuthProvider';
import { LogOut } from 'lucide-react';

function App() {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={
          <AuthGuard>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/ventes" element={<Ventes />} />
                    <Route path="/stock" element={<Stock />} />
                    <Route path="/achats" element={<Achats />} />
                    <Route path="/caisse" element={<Caisse />} />
                    <Route path="/marges" element={<Marges />} />
                    <Route path="/rapports" element={<Rapports />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </div>
  );
}

export default App;
