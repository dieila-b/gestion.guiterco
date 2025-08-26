
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

const Marges = () => {
  return (
    <AppLayout title="Marges">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6" />
              <CardTitle>Analyse des Marges</CardTitle>
            </div>
            <CardDescription>
              Module d'analyse des marges et rentabilité
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

export default Marges;
