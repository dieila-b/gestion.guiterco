
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ReportsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapports financiers</CardTitle>
        <CardDescription>Générer des rapports de caisse</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Période</Label>
              <Select defaultValue="day">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Caisse</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une caisse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Caisse principale</SelectItem>
                  <SelectItem value="2">Caisse secondaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button className="w-full sm:w-auto">Générer le rapport</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rapport quotidien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Résumé des transactions d'aujourd'hui</p>
                <Button variant="outline" className="w-full">Télécharger</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rapport mensuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Résumé du mois en cours</p>
                <Button variant="outline" className="w-full">Télécharger</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rapport annuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Synthèse de l'année en cours</p>
                <Button variant="outline" className="w-full">Télécharger</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
