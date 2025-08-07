
import React from 'react';
import { StrictPermissionGuard } from '@/components/auth/StrictPermissionGuard';
import DashboardContent from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <StrictPermissionGuard menu="Dashboard" action="read">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        </div>
        <DashboardContent />
      </div>
    </StrictPermissionGuard>
  );
};

export default Dashboard;
