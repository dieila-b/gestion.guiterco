
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const ClientsSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Paramètres Clients</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Paramètres clients disponibles prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsSettings;
