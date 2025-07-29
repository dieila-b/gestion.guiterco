
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import NewDashboard from '@/components/dashboard/NewDashboard';

const Index = () => {
  return (
    <AppLayout title="TABLEAU DE BORD">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Bienvenue sur votre tableau de bord GuIterCo</p>
      </div>
      <NewDashboard />
    </AppLayout>
  );
};

export default Index;
