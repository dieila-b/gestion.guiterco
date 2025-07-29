
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import NewDashboard from '@/components/dashboard/NewDashboard';

const Index = () => {
  return (
    <AppLayout title="TABLEAU DE BORD" subtitle="Bienvenue sur votre tableau de bord GuIterCo">
      <NewDashboard />
    </AppLayout>
  );
};

export default Index;
