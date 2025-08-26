
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

const Rapports = () => {
  return (
    <AppLayout title="Rapports">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <CardTitle>Rapports et Analyses</CardTitle>
            </div>
            <CardDescription>
              Module de génération de rapports et analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cette fonctionnalité sera bientôt disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Rapports;
