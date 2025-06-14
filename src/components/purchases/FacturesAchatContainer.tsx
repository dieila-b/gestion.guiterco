
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FacturesAchatTable } from './FacturesAchatTable';
import { FacturesAchatHeader } from './FacturesAchatHeader';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';

const FacturesAchatContainer = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();

  const handleNewFacture = () => {
    // TODO: Implement new facture dialog
    console.log('New facture dialog should open');
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement…</div>;
  }

  return (
    <div className="space-y-6">
      <FacturesAchatHeader onNewFacture={handleNewFacture} />
      
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

export default FacturesAchatContainer;
