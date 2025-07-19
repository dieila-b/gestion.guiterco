
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CaissesTab from "./CaissesTab";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ExpensesTabProps {
  initialSubTab?: string | null;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'caisses');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setLoading(true);
    setActiveSubTab(value);
    // Simuler un petit délai pour le chargement
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="caisses">Caisses</TabsTrigger>
          <TabsTrigger value="sorties">Sorties financières</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="caisses" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-gray-600">Chargement des données de caisse...</span>
              </CardContent>
            </Card>
          ) : (
            <CaissesTab />
          )}
        </TabsContent>

        <TabsContent value="sorties" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-gray-600">Chargement des sorties financières...</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sorties financières</CardTitle>
                <CardDescription>
                  Gestion des dépenses et sorties d'argent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module en cours de développement</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rapports" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2 text-gray-600">Génération des rapports...</span>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Rapports financiers</CardTitle>
                <CardDescription>
                  Analyses et statistiques des flux financiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Module en cours de développement</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesTab;
