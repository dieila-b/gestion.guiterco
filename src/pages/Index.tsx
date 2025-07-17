
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import NewDashboard from '@/components/dashboard/NewDashboard';

const Index = () => {
  return (
    <AppLayout title="Dashboard">
      <NewDashboard />
    </AppLayout>
  );
};

export default Index;
