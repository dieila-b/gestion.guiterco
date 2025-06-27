
import React, { useState } from 'react';
import { useBonLivraisonApproval } from '@/hooks/useBonLivraisonApproval';
import { useBonLivraisonPrecommandesCheck } from '@/hooks/useBonLivraisonPrecommandesCheck';
import PrecommandesAlertsDialog from './PrecommandesAlertsDialog';

interface ApprovalData {
  destinationType: 'entrepot' | 'point_vente';
  destinationId: string;
  articles: Array<{
    id: string;
    quantite_recue: number;
  }>;
}

interface BonLivraisonApprovalWithPrecommandesCheckProps {
  bonLivraisonId: string;
  approvalData: ApprovalData;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleApproval: () => void;
    isLoading: boolean;
  }) => React.ReactNode;
}

const BonLivraisonApprovalWithPrecommandesCheck = ({
  bonLivraisonId,
  approvalData,
  onSuccess,
  onError,
  children
}: BonLivraisonApprovalWithPrecommandesCheckProps) => {
  const [pendingApproval, setPendingApproval] = useState<ApprovalData | null>(null);
  
  const { approveBonLivraison, isApproving } = useBonLivraisonApproval();
  const { 
    isChecking, 
    alertsData, 
    showAlertsDialog, 
    checkPrecommandesForArticles, 
    closeAlertsDialog 
  } = useBonLivraisonPrecommandesCheck();

  const handleApproval = async () => {
    console.log('🔄 Début du processus d\'approbation avec vérification précommandes');
    
    // Préparer les données des articles pour la vérification
    const articlesForCheck = approvalData.articles.map(article => ({
      article_id: article.id, // Note: ici on utilise l'ID de l'article du bon de livraison
      quantite_recue: article.quantite_recue
    }));

    // Stocker les données d'approbation pour plus tard
    setPendingApproval(approvalData);
    
    // Vérifier les précommandes
    await checkPrecommandesForArticles(articlesForCheck);
  };

  const confirmApproval = async () => {
    if (!pendingApproval) return;
    
    try {
      await approveBonLivraison.mutateAsync({
        bonLivraisonId,
        approvalData: pendingApproval,
        skipPrecommandesCheck: true
      });
      
      closeAlertsDialog();
      setPendingApproval(null);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const cancelApproval = () => {
    closeAlertsDialog();
    setPendingApproval(null);
  };

  return (
    <>
      {children({
        handleApproval,
        isLoading: isChecking || isApproving
      })}
      
      <PrecommandesAlertsDialog
        open={showAlertsDialog}
        onClose={cancelApproval}
        alerts={alertsData}
        onConfirm={confirmApproval}
      />
    </>
  );
};

export default BonLivraisonApprovalWithPrecommandesCheck;
