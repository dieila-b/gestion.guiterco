
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const ZoneGeographique = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Zone Géographique</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration des zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Configuration des zones géographiques disponible prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoneGeographique;
