
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { useClientsEndettes } from '@/hooks/useClientStats';
import { StatsGlobales, ClientGroupe } from './types';
import { ClientsEndettesStats } from './components/ClientsEndettesStats';
import { ClientGroupeCard } from './components/ClientGroupeCard';
import { EmptyEndettesState } from './components/EmptyEndettesState';

const ClientsEndettes = () => {
  const { data: clientsEndettes = [], isLoading, error } = useClientsEndettes();

  const clientsGroupes = useMemo(() => {
    const grouped = clientsEndettes.reduce((acc, item) => {
      if (!acc[item.client_id]) {
        acc[item.client_id] = {
          client: {
            id: item.client_id,
            nom: item.client_nom,
            email: item.client_email,
            telephone: item.client_telephone
          },
          factures: [],
          totalDette: 0,
          totalFacture: 0,
          totalPaye: 0
        };
      }
      
      acc[item.client_id].factures.push({
        id: item.facture_id,
        numero_facture: item.numero_facture,
        date_facture: item.date_facture,
        montant_total: item.montant_total,
        montant_paye: item.montant_paye,
        reste_a_payer: item.reste_a_payer,
        statut_paiement: item.statut_paiement
      });
      
      acc[item.client_id].totalDette += item.reste_a_payer;
      acc[item.client_id].totalFacture += item.montant_total;
      acc[item.client_id].totalPaye += item.montant_paye;
      
      return acc;
    }, {} as any);

    return Object.values(grouped).sort((a: any, b: any) => b.totalDette - a.totalDette) as ClientGroupe[];
  }, [clientsEndettes]);

  const statsGlobales = useMemo((): StatsGlobales => {
    return clientsGroupes.reduce((acc: StatsGlobales, client: ClientGroupe) => {
      acc.totalClients = clientsGroupes.length;
      acc.totalDette += client.totalDette;
      acc.totalFactures += client.factures.length;
      acc.montantTotal += client.totalFacture;
      return acc;
    }, { totalClients: 0, totalDette: 0, totalFactures: 0, montantTotal: 0 });
  }, [clientsGroupes]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des clients endettés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Erreur lors du chargement des données</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <div>
            <CardTitle>Clients Endettés</CardTitle>
            <CardDescription>
              Suivi des factures impayées et des créances clients
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {clientsGroupes.length === 0 ? (
          <EmptyEndettesState />
        ) : (
          <>
            <ClientsEndettesStats stats={statsGlobales} />
            <div className="space-y-6">
              {clientsGroupes.map((clientGroupe) => (
                <ClientGroupeCard key={clientGroupe.client.id} clientGroupe={clientGroupe} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsEndettes;
