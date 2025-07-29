
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import NewDashboard from '@/components/dashboard/NewDashboard';

const Index = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">TABLEAU DE BORD</h1>
        <p className="text-sm text-muted-foreground">Bienvenue sur votre tableau de bord GuIterCo</p>
      </div>
      <NewDashboard />
    </AppLayout>
  );
};

export default Index;
