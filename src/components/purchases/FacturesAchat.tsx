
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFacturesAchat } from "@/hooks/useFacturesAchat";
import { FacturesAchatTable } from "./FacturesAchatTable";

const FacturesAchat = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Factures d'achat</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures d'achat</CardTitle>
        </CardHeader>
        <CardContent>
          <FacturesAchatTable facturesAchat={facturesAchat || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesAchat;
