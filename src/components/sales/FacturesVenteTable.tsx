
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import FacturesVenteActions from './FacturesVenteActions';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteTableProps {
  factures: FactureVente[];
  isLoading: boolean;
}

const FacturesVenteTable = ({ factures, isLoading }: FacturesVenteTableProps) => {
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'payee': return 'bg-green-100 text-green-800 border-green-300';
      case 'partiellement_payee': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_retard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'payee': return 'Payée';
      case 'partiellement_payee': return 'Partielle';
      case 'en_retard': return 'En retard';
      default: return statut;
    }
  };

  const calculatePaidAmount = (facture: FactureVente) => {
    if (facture.statut_paiement === 'payee') {
      return facture.montant_ttc;
    }
    // Calculer le montant payé à partir des versements
    const versements = facture.versements || [];
    return versements.reduce((total: number, versement: any) => total + (versement.montant || 0), 0);
  };

  const calculateRemainingAmount = (facture: FactureVente) => {
    const paid = calculatePaidAmount(facture);
    return Math.max(0, facture.montant_ttc - paid);
  };

  const getArticleCount = (facture: FactureVente) => {
    const lignes = facture.lignes_facture || [];
    return lignes.length;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des factures...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-left">N° Facture</TableHead>
            <TableHead className="font-semibold text-left">Date</TableHead>
            <TableHead className="font-semibold text-left">Client</TableHead>
            <TableHead className="font-semibold text-center">Articles</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
            <TableHead className="font-semibold text-right">Payé</TableHead>
            <TableHead className="font-semibold text-right">Restant</TableHead>
            <TableHead className="font-semibold text-center">Paiement</TableHead>
            <TableHead className="font-semibold text-center">Livraison</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures && factures.length > 0 ? (
            factures.map((facture) => (
              <TableRow key={facture.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-blue-600">
                  {facture.numero_facture}
                </TableCell>
                <TableCell>
                  {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="font-medium">
                  {facture.client ? facture.client.nom : 'Client non spécifié'}
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{getArticleCount(facture)}</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(facture.montant_ttc)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculatePaidAmount(facture))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(calculateRemainingAmount(facture))}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusBadgeColor(facture.statut_paiement)} font-medium`}
                  >
                    {getStatusLabel(facture.statut_paiement)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Livrée
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <FacturesVenteActions facture={facture} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <div className="text-muted-foreground">
                  Aucune facture de vente trouvée
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesVenteTable;
