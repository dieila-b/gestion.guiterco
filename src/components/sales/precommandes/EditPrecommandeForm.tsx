
import React from 'react';
import type { PrecommandeComplete } from '@/types/precommandes';
import { useCatalogue } from '@/hooks/useCatalogue';
import { BasicInfoSection } from './form/BasicInfoSection';
import { StatusSection } from './form/StatusSection';
import { PaymentSection } from './form/PaymentSection';
import { DeliveryStatusSection } from './form/DeliveryStatusSection';
import { ArticlesSection } from './form/ArticlesSection';
import { TotalsSection } from './form/TotalsSection';
import { ObservationsSection } from './form/ObservationsSection';
import { PrecommandeFormActions } from './form/PrecommandeFormActions';
import { LoadingState } from './form/LoadingState';
import { usePrecommandeFormLogic } from './form/PrecommandeFormLogic';

interface EditPrecommandeFormProps {
  precommande: PrecommandeComplete;
  onSave: (updates: any, lignes?: any[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type StatutType = 'confirmee' | 'en_preparation' | 'prete' | 'partiellement_livree' | 'livree' | 'annulee' | 'convertie_en_vente';
type StatutLivraisonType = 'en_attente' | 'partiellement_livree' | 'livree';

const EditPrecommandeForm = ({ precommande, onSave, onCancel, isLoading }: EditPrecommandeFormProps) => {
  const { articles } = useCatalogue();
  
  const {
    formData,
    setFormData,
    nouvelAcompte,
    setNouvelAcompte,
    lignes,
    isLoadingLignes,
    handleLigneChange,
    handleDeleteLigne,
    handleAddLigne,
    calculateTotals
  } = usePrecommandeFormLogic({ precommande });

  console.log('📋 Lignes actuelles dans le formulaire:', lignes.map(l => ({
    id: l.id,
    quantite: l.quantite,
    quantite_livree: l.quantite_livree
  })));

  const handleSubmit = () => {
    const totals = calculateTotals();
    
    // Calculer le nouveau montant total payé (ancien acompte + nouveau versement)
    const nouveauMontantPaye = formData.acompte_verse + nouvelAcompte;
    const resteAPayer = totals.montantTTC - nouveauMontantPaye;
    
    // Déterminer le statut de paiement
    let statutPaiement = 'en_attente';
    if (nouveauMontantPaye > 0) {
      statutPaiement = nouveauMontantPaye >= totals.montantTTC ? 'paye' : 'partiel';
    }

    console.log('💾 Sauvegarde précommande avec lignes:', lignes.map(l => ({
      id: l.id,
      quantite: l.quantite,
      quantite_livree: l.quantite_livree
    })));

    const updates = {
      ...formData,
      montant_ht: totals.montantTTC,
      tva: 0,
      montant_ttc: totals.montantTTC,
      taux_tva: 0,
      acompte_verse: nouveauMontantPaye,
      reste_a_payer: resteAPayer,
      statut_paiement: statutPaiement,
      statut_livraison: formData.statut_livraison
    };

    onSave(updates, lignes);
  };

  const { montantTTC } = calculateTotals();

  if (isLoadingLignes) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <BasicInfoSection
        dateLivraisonPrevue={formData.date_livraison_prevue}
        onDateLivraisonChange={(value) => setFormData({ ...formData, date_livraison_prevue: value })}
      />

      {/* Section Articles - Maintenant juste après la date de livraison */}
      <ArticlesSection
        lignes={lignes}
        articles={articles}
        onLigneChange={handleLigneChange}
        onDeleteLigne={handleDeleteLigne}
        onAddLigne={handleAddLigne}
      />

      {/* Section Totaux */}
      <TotalsSection
        montantTTC={montantTTC}
        resteAPayer={montantTTC - (formData.acompte_verse + nouvelAcompte)}
      />

      {/* Sections Statuts - Maintenant en bas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">📊 Statuts de la précommande</h3>
          <StatusSection
            statut={formData.statut}
            statutLivraison={formData.statut_livraison}
            onStatutChange={(value: StatutType) => setFormData({ ...formData, statut: value })}
            onStatutLivraisonChange={(value: StatutLivraisonType) => setFormData({ ...formData, statut_livraison: value })}
          />
        </div>

        <DeliveryStatusSection
          statutLivraison={formData.statut_livraison}
          lignes={lignes}
          onStatutLivraisonChange={(value: StatutLivraisonType) => setFormData({ ...formData, statut_livraison: value })}
          isLoadingLignes={isLoadingLignes}
        />
      </div>

      {/* Section Paiement */}
      <PaymentSection
        acompteVerse={formData.acompte_verse}
        montantTTC={montantTTC}
        onNouvelAcompteChange={setNouvelAcompte}
      />

      <ObservationsSection
        observations={formData.observations}
        onObservationsChange={(value) => setFormData({ ...formData, observations: value })}
      />

      <PrecommandeFormActions
        onSave={handleSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditPrecommandeForm;
