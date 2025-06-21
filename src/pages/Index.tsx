
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ModernDashboard from '@/components/dashboard/ModernDashboard';

const Index = () => {
  return (
    <AppLayout title="Dashboard">
      <ModernDashboard />
    </AppLayout>
  );
};

export default Index;
