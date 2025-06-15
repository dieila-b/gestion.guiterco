
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
    console.log(`💰 Calculating paid amount for ${facture.numero_facture}:`, facture.versements);
    
    if (!facture.versements || !Array.isArray(facture.versements)) {
      console.log(`No versements found for ${facture.numero_facture}`);
      return 0;
    }
    
    const total = facture.versements.reduce((sum: number, versement: any) => {
      const montant = versement.montant || 0;
      console.log(`Adding versement: ${montant}`);
      return sum + montant;
    }, 0);
    
    console.log(`Total paid for ${facture.numero_facture}: ${total}`);
    return total;
  };

  const calculateRemainingAmount = (facture: FactureVente) => {
    const paid = calculatePaidAmount(facture);
    const remaining = Math.max(0, facture.montant_ttc - paid);
    console.log(`Remaining amount for ${facture.numero_facture}: ${remaining} (Total: ${facture.montant_ttc}, Paid: ${paid})`);
    return remaining;
  };

  // Calcul dynamique du statut de paiement basé sur les versements réels
  const getActualPaymentStatus = (facture: FactureVente) => {
    const paidAmount = calculatePaidAmount(facture);
    const totalAmount = facture.montant_ttc;
    
    console.log(`Payment status calculation for ${facture.numero_facture}:`, {
      paid: paidAmount,
      total: totalAmount,
      percentage: (paidAmount / totalAmount) * 100
    });
    
    if (paidAmount === 0) {
      return 'en_attente';
    } else if (paidAmount >= totalAmount) {
      return 'payee';
    } else {
      return 'partiellement_payee';
    }
  };

  const getArticleCount = (facture: FactureVente) => {
    console.log(`📦 Getting article count for ${facture.numero_facture}:`, {
      nb_articles_from_function: facture.nb_articles,
      lignes_facture_array: facture.lignes_facture,
      lignes_facture_length: facture.lignes_facture?.length
    });
    
    // Utiliser nb_articles en priorité (calculé par la fonction SQL)
    if (typeof facture.nb_articles === 'number' && facture.nb_articles >= 0) {
      console.log(`Using nb_articles from function: ${facture.nb_articles}`);
      return facture.nb_articles;
    }
    
    // Fallback: compter les lignes de facture
    if (facture.lignes_facture && Array.isArray(facture.lignes_facture)) {
      const count = facture.lignes_facture.length;
      console.log(`Using lignes_facture length: ${count}`);
      return count;
    }
    
    console.log(`No articles found for ${facture.numero_facture}`);
    return 0;
  };

  // Calcul dynamique du statut de livraison
  const getActualDeliveryStatus = (facture: FactureVente) => {
    console.log(`🚚 Getting delivery status for ${facture.numero_facture}:`, {
      statut_livraison_from_db: facture.statut_livraison,
      lignes_facture: facture.lignes_facture
    });
    
    // Si on a le statut calculé par la fonction SQL, l'utiliser
    if (facture.statut_livraison) {
      console.log(`Using delivery status from function: ${facture.statut_livraison}`);
      return facture.statut_livraison;
    }
    
    // Fallback: calculer en fonction des lignes
    if (!facture.lignes_facture || !Array.isArray(facture.lignes_facture) || facture.lignes_facture.length === 0) {
      console.log(`No lines found, defaulting to livree`);
      return 'livree'; // Pas d'articles = livré par défaut
    }
    
    const totalLignes = facture.lignes_facture.length;
    const lignesLivrees = facture.lignes_facture.filter((ligne: any) => ligne.statut_livraison === 'livree').length;
    
    console.log(`Delivery calculation:`, {
      total: totalLignes,
      livrees: lignesLivrees
    });
    
    if (lignesLivrees === 0) {
      return 'en_attente';
    } else if (lignesLivrees === totalLignes) {
      return 'livree';
    } else {
      return 'partiellement_livree';
    }
  };

  // Badge de livraison avec statut calculé dynamiquement
  const getLivraisonBadge = (facture: FactureVente) => {
    const statut = getActualDeliveryStatus(facture);
    
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

  console.log('🖥️ Rendering table with factures:', factures?.length || 0);

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
              
              console.log(`🧾 Rendering row for ${facture.numero_facture}:`, {
                articles: articleCount,
                paymentStatus: actualPaymentStatus,
                paid: paidAmount,
                remaining: remainingAmount
              });
              
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
                    <span className="font-medium text-lg text-blue-600">{articleCount}</span>
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
