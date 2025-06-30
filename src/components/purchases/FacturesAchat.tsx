
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useFacturesAchat } from '@/hooks/useFacturesAchat';
import { useAllFactureAchatArticles } from '@/hooks/useFactureAchatArticles';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { useAllReglementsAchat } from '@/hooks/useReglementsAchat';
import FacturesAchatHeader from './FacturesAchatHeader';
import FacturesAchatSearch from './FacturesAchatSearch';
import FacturesAchatTable from './FacturesAchatTable';
import { getStatusBadgeColor, getStatusLabel } from './FacturesAchatUtils';

const FacturesAchat = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();
  const { data: articlesCounts } = useAllFactureAchatArticles();
  const { data: bonCommandeArticlesCounts } = useAllBonCommandeArticles();
  const { data: reglementsAchat } = useAllReglementsAchat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFactures = facturesAchat?.filter(facture => 
    facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate derived values for each invoice
  const getArticleCount = (facture: any) => {
    // Priorité 1: Articles directement liés à la facture
    const directArticles = articlesCounts?.[facture.id] || 0;
    if (directArticles > 0) {
      return directArticles;
    }
    
    // Priorité 2: Articles du bon de commande lié (pour les factures auto-générées)
    if (facture.bon_commande_id) {
      const bonCommandeArticles = bonCommandeArticlesCounts?.[facture.bon_commande_id] || 0;
      return bonCommandeArticles;
    }
    
    return 0;
  };

  const getPaidAmount = (facture: any) => {
    // Calculer le montant total payé (acomptes + règlements)
    let totalPaid = 0;
    
    // Ajouter l'acompte du bon de commande si disponible
    if (facture.bon_commande?.montant_paye) {
      totalPaid += facture.bon_commande.montant_paye;
    }
    
    // Ajouter les règlements de la table reglements_achat
    if (reglementsAchat && reglementsAchat[facture.id]) {
      totalPaid += reglementsAchat[facture.id];
    }
    
    // Fallback: Ajouter les règlements depuis la relation (si disponible)
    if (facture.reglements && Array.isArray(facture.reglements)) {
      const reglementsTotal = facture.reglements.reduce((sum: number, reglement: any) => {
        return sum + (reglement.montant || 0);
      }, 0);
      totalPaid += reglementsTotal;
    }
    
    return totalPaid;
  };

  const getRemainingAmount = (facture: any) => {
    const paidAmount = getPaidAmount(facture);
    return Math.max(0, facture.montant_ttc - paidAmount);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <FacturesAchatHeader />
        <CardContent>
          <FacturesAchatSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <FacturesAchatTable
            filteredFactures={filteredFactures || []}
            getArticleCount={getArticleCount}
            getPaidAmount={getPaidAmount}
            getRemainingAmount={getRemainingAmount}
            getStatusBadgeColor={getStatusBadgeColor}
            getStatusLabel={getStatusLabel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturesAchat;
