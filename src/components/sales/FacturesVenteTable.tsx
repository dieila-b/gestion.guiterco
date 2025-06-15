
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
    // Calculer le montant payé à partir des versements
    const versements = facture.versements || [];
    return versements.reduce((total: number, versement: any) => total + (versement.montant || 0), 0);
  };

  const calculateRemainingAmount = (facture: FactureVente) => {
    const paid = calculatePaidAmount(facture);
    return Math.max(0, facture.montant_ttc - paid);
  };

  // Calcul dynamique du statut de paiement basé sur les versements réels
  const getActualPaymentStatus = (facture: FactureVente) => {
    const paidAmount = calculatePaidAmount(facture);
    const totalAmount = facture.montant_ttc;
    
    if (paidAmount === 0) {
      return 'en_attente';
    } else if (paidAmount >= totalAmount) {
      return 'payee';
    } else {
      return 'partiellement_payee';
    }
  };

  const getArticleCount = (facture: FactureVente) => {
    // Utiliser nb_articles en priorité (calculé par la fonction SQL)
    if (typeof facture.nb_articles === 'number' && facture.nb_articles >= 0) {
      return facture.nb_articles;
    }
    
    // Fallback: compter les lignes de facture
    if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
      return facture.lignes_facture.length;
    }
    
    return 0;
  };

  // Badge de livraison basé sur le statut calculé dynamiquement
  const getLivraisonBadge = (facture: FactureVente) => {
    const statut = facture.statut_livraison || 'en_attente';
    
    switch (statut) {
      case 'en_attente':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            En attente
          </Badge>
        );
      case 'partiellement_livree':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Partielle
          </Badge>
        );
      case 'livree':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Livrée
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Non défini
          </Badge>
        );
    }
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
            factures.map((facture) => {
              const articleCount = getArticleCount(facture);
              const actualPaymentStatus = getActualPaymentStatus(facture);
              const paidAmount = calculatePaidAmount(facture);
              const remainingAmount = calculateRemainingAmount(facture);
              
              return (
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
                    <span className="font-medium">{articleCount}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(facture.montant_ttc)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(paidAmount)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(remainingAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusBadgeColor(actualPaymentStatus)} font-medium`}
                    >
                      {getStatusLabel(actualPaymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getLivraisonBadge(facture)}
                  </TableCell>
                  <TableCell className="text-center">
                    <FacturesVenteActions facture={facture} />
                  </TableCell>
                </TableRow>
              );
            })
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
