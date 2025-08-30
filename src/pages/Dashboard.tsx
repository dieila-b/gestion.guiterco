
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { AccessibleMenusList } from '@/components/layout/AccessibleMenusList';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import RecentSales from '@/components/dashboard/RecentSales';
import StockAlerts from '@/components/dashboard/StockAlerts';
import QuickActions from '@/components/dashboard/QuickActions';

const Dashboard = () => {
  return (
    <AppLayout title="Tableau de bord">
      <PermissionGuard 
        menu="Dashboard" 
        action="read"
        fallback={
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <Alert className="max-w-md">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-center">
                  <div className="font-medium mb-2">Accès au tableau de bord non autorisé</div>
                  <div className="text-sm text-muted-foreground">
                    Vous n'avez pas les permissions nécessaires pour consulter le tableau de bord.
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <AccessibleMenusList />
          </div>
        }
      >
        <div className="space-y-6">
          <DashboardOverview />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentSales />
            </div>
            <div>
              <StockAlerts />
            </div>
          </div>
          
          <QuickActions />
        </div>
      </PermissionGuard>
    </AppLayout>
  );
};

export default Dashboard;
