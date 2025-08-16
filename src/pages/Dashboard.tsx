
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import SettingsPage from '@/pages/SettingsPage';

const Dashboard = () => {
  return (
    <AppLayout title="Tableau de bord" subtitle="Vue d'ensemble de votre activité">
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/settings/*" element={<SettingsPage />} />
        <Route path="/sales" element={<div className="p-6"><h2 className="text-2xl font-bold">Ventes</h2><p>Module des ventes en développement...</p></div>} />
        <Route path="/stocks" element={<div className="p-6"><h2 className="text-2xl font-bold">Stocks</h2><p>Module de gestion des stocks en développement...</p></div>} />
        <Route path="/purchases" element={<div className="p-6"><h2 className="text-2xl font-bold">Achats</h2><p>Module des achats en développement...</p></div>} />
        <Route path="/clients" element={<div className="p-6"><h2 className="text-2xl font-bold">Clients</h2><p>Module de gestion des clients en développement...</p></div>} />
        <Route path="/cash-registers" element={<div className="p-6"><h2 className="text-2xl font-bold">Caisse</h2><p>Module de gestion de caisse en développement...</p></div>} />
        <Route path="/margins" element={<div className="p-6"><h2 className="text-2xl font-bold">Marges</h2><p>Module d'analyse des marges en développement...</p></div>} />
        <Route path="/reports" element={<div className="p-6"><h2 className="text-2xl font-bold">Rapports</h2><p>Module de génération de rapports en développement...</p></div>} />
      </Routes>
    </AppLayout>
  );
};

export default Dashboard;
