
import React from 'react';
import { StrictPermissionGuard } from '@/components/auth/StrictPermissionGuard';
import NewDashboard from '@/components/dashboard/NewDashboard';

const Dashboard = () => {
  return (
    <StrictPermissionGuard menu="Dashboard" action="read">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        </div>
        <NewDashboard />
      </div>
    </StrictPermissionGuard>
  );
};

export default Dashboard;
