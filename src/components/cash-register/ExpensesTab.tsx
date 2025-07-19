
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OptimizedCaissesTab from "./OptimizedCaissesTab";
import { OptimizedLoading } from "@/components/ui/optimized-loading";

interface ExpensesTabProps {
  initialSubTab?: string | null;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ initialSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'caisses');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setLoading(true);
    setActiveSubTab(value);
    // Délai minimal pour éviter les flashs
    setTimeout(() => setLoading(false), 100);
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
              <CardContent className="py-8">
                <OptimizedLoading type="spinner" text="Chargement des données de caisse..." />
              </CardContent>
            </Card>
          ) : (
            <OptimizedCaissesTab />
          )}
        </TabsContent>

        <TabsContent value="sorties" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <OptimizedLoading type="spinner" text="Chargement des sorties financières..." />
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
              <CardContent className="py-8">
                <OptimizedLoading type="spinner" text="Génération des rapports..." />
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
