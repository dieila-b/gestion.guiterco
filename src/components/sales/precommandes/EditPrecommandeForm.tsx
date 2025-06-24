import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { PrecommandeComplete, LignePrecommandeComplete } from '@/types/precommandes';
import { useCatalogue } from '@/hooks/useCatalogue';
import { BasicInfoSection } from './form/BasicInfoSection';
import { StatusSection } from './form/StatusSection';
import { PaymentSection } from './form/PaymentSection';
import { ArticlesSection } from './form/ArticlesSection';
import { TotalsSection } from './form/TotalsSection';
import { ObservationsSection } from './form/ObservationsSection';

interface EditPrecommandeFormProps {
  precommande: PrecommandeComplete;
  onSave: (updates: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

type StatutType = 'confirmee' | 'en_preparation' | 'prete' | 'partiellement_livree' | 'livree' | 'annulee' | 'convertie_en_vente';

const EditPrecommandeForm = ({ precommande, onSave, onCancel, isLoading }: EditPrecommandeFormProps) => {
  const { articles } = useCatalogue();
  const [formData, setFormData] = useState({
    observations: precommande.observations || '',
    date_livraison_prevue: precommande.date_livraison_prevue 
      ? new Date(precommande.date_livraison_prevue).toISOString().split('T')[0] 
      : '',
    acompte_verse: precommande.acompte_verse || 0,
    statut: precommande.statut || 'confirmee',
    taux_tva: precommande.taux_tva || 0 // Défaut à 0%
  });

  const [nouvelAcompte, setNouvelAcompte] = useState(0);

  const [lignes, setLignes] = useState<LignePrecommandeComplete[]>(
    precommande.lignes_precommande || []
  );

  const handleLigneChange = (index: number, field: string, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: value,
      montant_ligne: field === 'quantite' || field === 'prix_unitaire' 
        ? (field === 'quantite' ? value : newLignes[index].quantite) * 
          (field === 'prix_unitaire' ? value : newLignes[index].prix_unitaire)
        : newLignes[index].montant_ligne
    };
    setLignes(newLignes);
  };

  const handleDeleteLigne = (index: number) => {
    const newLignes = lignes.filter((_, i) => i !== index);
    setLignes(newLignes);
  };

  const handleAddLigne = () => {
    const newLigne: LignePrecommandeComplete = {
      id: `temp-${Date.now()}`,
      precommande_id: precommande.id,
      article_id: '',
      quantite: 1,
      quantite_livree: 0,
      prix_unitaire: 0,
      montant_ligne: 0,
      created_at: new Date().toISOString(),
      statut_ligne: 'en_attente'
    };
    setLignes([...lignes, newLigne]);
  };

  const calculateTotals = () => {
    const montantHT = lignes.reduce((sum, ligne) => sum + ligne.montant_ligne, 0);
    const tva = montantHT * (formData.taux_tva / 100);
    const montantTTC = montantHT + tva;
    return { montantHT, tva, montantTTC };
  };

  const calculateDeliveryStatus = () => {
    if (!lignes || lignes.length === 0) return 'en_attente';

    const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

    if (totalLivree === totalQuantite && totalQuantite > 0) {
      return 'livree';
    } else if (totalLivree > 0) {
      return 'partiellement_livree';
    } else {
      return 'en_attente';
    }
  };

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

    console.log('Calcul acompte:', {
      ancienAcompte: formData.acompte_verse,
      nouvelAcompte: nouvelAcompte,
      nouveauMontantPaye: nouveauMontantPaye,
      montantTTC: totals.montantTTC,
      resteAPayer: resteAPayer,
      statutPaiement: statutPaiement
    });

    onSave({
      ...formData,
      lignes_precommande: lignes,
      montant_ht: totals.montantHT,
      tva: totals.tva,
      montant_ttc: totals.montantTTC,
      acompte_verse: nouveauMontantPaye, // Le nouveau montant total payé
      reste_a_payer: resteAPayer,
      statut_paiement: statutPaiement
    });
  };

  const { montantHT, tva, montantTTC } = calculateTotals();
  const deliveryStatus = calculateDeliveryStatus();

  return (
    <div className="space-y-6">
      <BasicInfoSection
        dateLivraisonPrevue={formData.date_livraison_prevue}
        tauxTva={formData.taux_tva}
        onDateLivraisonChange={(value) => setFormData({ ...formData, date_livraison_prevue: value })}
        onTauxTvaChange={(value) => setFormData({ ...formData, taux_tva: value })}
      />

      <StatusSection
        statut={formData.statut}
        deliveryStatus={deliveryStatus}
        onStatutChange={(value: StatutType) => setFormData({ ...formData, statut: value })}
      />

      <PaymentSection
        acompteVerse={formData.acompte_verse}
        montantHT={montantHT}
        tva={tva}
        montantTTC={montantTTC}
        tauxTva={formData.taux_tva}
        onNouvelAcompteChange={setNouvelAcompte}
      />

      <ArticlesSection
        lignes={lignes}
        articles={articles}
        onLigneChange={handleLigneChange}
        onDeleteLigne={handleDeleteLigne}
        onAddLigne={handleAddLigne}
      />

      <TotalsSection
        montantHT={montantHT}
        tva={tva}
        montantTTC={montantTTC}
        resteAPayer={montantTTC - (formData.acompte_verse + nouvelAcompte)}
        tauxTva={formData.taux_tva}
      />

      <ObservationsSection
        observations={formData.observations}
        onObservationsChange={(value) => setFormData({ ...formData, observations: value })}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};

export default EditPrecommandeForm;
