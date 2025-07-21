
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const Marges = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marges</h1>
        <p className="text-muted-foreground">Analyse des marges et rentabilité</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analyse des marges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune donnée</h3>
            <p className="text-muted-foreground">
              Les analyses de marges apparaîtront ici une fois que vous aurez des ventes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
