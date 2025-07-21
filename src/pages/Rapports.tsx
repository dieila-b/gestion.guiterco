
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Rapports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p className="text-muted-foreground">Génération de rapports et analyses</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Générer rapport
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun rapport</h3>
            <p className="text-muted-foreground mb-4">
              Générez vos premiers rapports d'activité
            </p>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Générer rapport
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
