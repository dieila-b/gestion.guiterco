
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Printer, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import EditFactureDialog from './actions/EditFactureDialog';
import { printFactureVente, printTicket } from './actions/print';
import type { FactureImpayee } from '@/hooks/sales/queries/useFacturesImpayeesQuery';

interface FacturesImpayeesTableProps {
  factures: FactureImpayee[];
  isLoading: boolean;
}

const FacturesImpayeesTable: React.FC<FacturesImpayeesTableProps> = ({
  factures,
  isLoading
}) => {
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
      case 'En attente':
        return 'destructive';
      case 'partiellement_payee':
      case 'Partiellement payée':
        return 'default';
      default: 
        return 'secondary';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
      case 'En attente':
        return 'En attente';
      case 'partiellement_payee':
      case 'Partiellement payée':
        return 'Partiellement payée';
      default: 
        return statut;
    }
  };

  const getDeliveryStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente':
      case 'En attente':
        return 'default';
      case 'partiellement_livree':
      case 'Partiellement livrée':
        return 'secondary';
      case 'livree':
      case 'Livrée':
        return 'outline';
      default: 
        return 'secondary';
    }
  };

  const getDeliveryStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
      case 'En attente':
        return 'En attente';
      case 'partiellement_livree':
      case 'Partiellement livrée':
        return 'Partielle';
      case 'livree':
      case 'Livrée':
        return 'Livrée';
      default: 
        return statut;
    }
  };

  // Récupérer les données complètes de la facture pour l'impression
  const handlePrintFacture = async (facture: FactureImpayee) => {
    console.log('🖨️ Impression facture avec détails complets...');
    
    try {
      // Récupérer la facture complète avec toutes les lignes détaillées
      const { data: factureComplete, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(*),
          lignes_facture:lignes_facture_vente(
            *,
            article:catalogue(*)
          ),
          versements:versements_clients(*)
        `)
        .eq('id', facture.facture_id)
        .single();

      if (error || !factureComplete) {
        console.error('❌ Erreur récupération facture complète:', error);
        return;
      }

      console.log('📄 Facture complète récupérée:', factureComplete);
      printFactureVente(factureComplete as any);
    } catch (error) {
      console.error('❌ Erreur impression facture:', error);
    }
  };

  const handlePrintTicket = async (facture: FactureImpayee) => {
    console.log('🎫 Impression ticket avec détails complets...');
    
    try {
      // Récupérer la facture complète avec toutes les lignes détaillées
      const { data: factureComplete, error } = await supabase
        .from('factures_vente')
        .select(`
          *,
          client:clients(*),
          lignes_facture:lignes_facture_vente(
            *,
            article:catalogue(*)
          ),
          versements:versements_clients(*)
        `)
        .eq('id', facture.facture_id)
        .single();

      if (error || !factureComplete) {
        console.error('❌ Erreur récupération facture complète:', error);
        return;
      }

      console.log('🎫 Facture complète récupérée pour ticket:', factureComplete);
      printTicket(factureComplete as any);
    } catch (error) {
      console.error('❌ Erreur impression ticket:', error);
    }
  };

  // Calculer le total des restants
  const totalRestant = factures.reduce((sum, facture) => sum + facture.restant, 0);

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement des factures impayées...</div>;
  }

  if (!factures || factures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune facture impayée trouvée</p>
        <p className="text-sm text-gray-500 mt-2">
          Les factures avec statut "En attente" ou "Partiellement payée" apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total des restants dûs */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-red-800 font-medium">Total restant dû :</span>
          <span className="text-red-900 font-bold text-lg">
            {formatCurrency(totalRestant)}
          </span>
        </div>
        <div className="text-sm text-red-600 mt-1">
          {factures.length} facture{factures.length > 1 ? 's' : ''} impayée{factures.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead className="text-right">Restant</TableHead>
              <TableHead>Statut Paiement</TableHead>
              <TableHead>Statut Livraison</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.map((facture) => (
              <TableRow key={facture.facture_id}>
                <TableCell className="font-medium">
                  {facture.numero_facture}
                </TableCell>
                <TableCell>
                  {format(new Date(facture.date_iso), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{facture.client}</TableCell>
                <TableCell>
                  <span className="font-medium text-lg text-blue-600">
                    {facture.articles}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(facture.total)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(facture.paye)}
                </TableCell>
                <TableCell className="text-right font-semibold text-red-600">
                  {formatCurrency(facture.restant)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeColor(facture.statut_paiement) as any}>
                    {getStatusLabel(facture.statut_paiement)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getDeliveryStatusBadgeColor(facture.statut_livraison) as any}>
                    {getDeliveryStatusLabel(facture.statut_livraison)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-center">
                    {/* Bouton Éditer */}
                    <EditFactureDialog 
                      facture={{
                        id: facture.facture_id,
                        numero_facture: facture.numero_facture,
                        date_facture: facture.date_iso,
                        client_id: facture.facture_id, // Utiliser facture_id temporairement
                        client: { nom: facture.client },
                        montant_ttc: facture.total,
                        statut_paiement: facture.statut_paiement,
                        statut_livraison: facture.statut_livraison,
                        versements: [],
                        lignes_facture: []
                      } as any}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-orange-600 hover:text-orange-800 p-1"
                        title="Éditer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </EditFactureDialog>
                    
                    {/* Bouton Imprimer */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrintFacture(facture)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Imprimer la facture"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    
                    {/* Bouton Reçu */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrintTicket(facture)}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="Imprimer le reçu"
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FacturesImpayeesTable;
