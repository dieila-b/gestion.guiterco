
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { PrecommandeComplete, LignePrecommandeComplete } from '@/types/precommandes';
import { useCatalogue } from '@/hooks/useCatalogue';
import { BasicInfoSection } from './form/BasicInfoSection';
import { StatusSection } from './form/StatusSection';
import { PaymentSection } from './form/PaymentSection';
import { ArticlesSection } from './form/ArticlesSection';
import { TotalsSection } from './form/TotalsSection';
import { ObservationsSection } from './form/ObservationsSection';
import { supabase } from '@/integrations/supabase/client';

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
  const [formData, setFormData] = useState({
    observations: precommande.observations || '',
    date_livraison_prevue: precommande.date_livraison_prevue 
      ? new Date(precommande.date_livraison_prevue).toISOString().split('T')[0] 
      : '',
    acompte_verse: precommande.acompte_verse || 0,
    statut: precommande.statut || 'confirmee',
    statut_livraison: 'en_attente' as StatutLivraisonType
  });

  const [nouvelAcompte, setNouvelAcompte] = useState(0);
  const [lignes, setLignes] = useState<LignePrecommandeComplete[]>([]);
  const [isLoadingLignes, setIsLoadingLignes] = useState(true);

  // Charger les lignes avec les vraies quantités livrées depuis la base
  useEffect(() => {
    const loadLignesFromDB = async () => {
      if (!precommande.id) return;
      
      setIsLoadingLignes(true);
      console.log('🔄 Chargement des lignes depuis la base pour précommande:', precommande.id);
      
      try {
        const { data: lignesDB, error } = await supabase
          .from('lignes_precommande')
          .select('*')
          .eq('precommande_id', precommande.id)
          .order('created_at');

        if (error) {
          console.error('❌ Erreur chargement lignes:', error);
          // Fallback vers les données de la prop
          setLignes(precommande.lignes_precommande || []);
        } else {
          console.log('✅ Lignes chargées depuis DB:', lignesDB);
          setLignes(lignesDB || []);
        }
      } catch (error) {
        console.error('❌ Erreur critique chargement lignes:', error);
        setLignes(precommande.lignes_precommande || []);
      } finally {
        setIsLoadingLignes(false);
      }
    };

    loadLignesFromDB();
  }, [precommande.id, precommande.lignes_precommande]);

  // Calculer le statut de livraison basé sur les quantités
  const calculateDeliveryStatus = (): StatutLivraisonType => {
    if (!lignes || lignes.length === 0) return 'en_attente';

    const totalQuantite = lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
    const totalLivree = lignes.reduce((sum, ligne) => sum + (ligne.quantite_livree || 0), 0);

    if (totalLivree === 0) {
      return 'en_attente';
    } else if (totalLivree >= totalQuantite) {
      return 'livree';
    } else {
      return 'partiellement_livree';
    }
  };

  // Mettre à jour le statut de livraison quand les lignes changent
  useEffect(() => {
    if (!isLoadingLignes) {
      const calculatedStatus = calculateDeliveryStatus();
      setFormData(prev => ({
        ...prev,
        statut_livraison: calculatedStatus
      }));
    }
  }, [lignes, isLoadingLignes]);

  console.log('📋 Lignes actuelles dans le formulaire:', lignes.map(l => ({
    id: l.id,
    quantite: l.quantite,
    quantite_livree: l.quantite_livree
  })));

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
    
    console.log(`🔄 Modification ligne ${index}, champ ${field}:`, value);
    if (field === 'quantite_livree') {
      console.log(`📦 Nouvelle quantité livrée pour ligne ${newLignes[index].id}: ${value}`);
    }
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
    const montantTTC = lignes.reduce((sum, ligne) => sum + ligne.montant_ligne, 0);
    return { montantTTC };
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

    console.log('💾 Sauvegarde précommande avec lignes:', lignes.map(l => ({
      id: l.id,
      quantite: l.quantite,
      quantite_livree: l.quantite_livree
    })));

    const updates = {
      ...formData,
      montant_ht: totals.montantTTC, // Plus de distinction HT/TTC sans TVA
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BasicInfoSection
        dateLivraisonPrevue={formData.date_livraison_prevue}
        onDateLivraisonChange={(value) => setFormData({ ...formData, date_livraison_prevue: value })}
      />

      <StatusSection
        statut={formData.statut}
        statutLivraison={formData.statut_livraison}
        onStatutChange={(value: StatutType) => setFormData({ ...formData, statut: value })}
        onStatutLivraisonChange={(value: StatutLivraisonType) => setFormData({ ...formData, statut_livraison: value })}
      />

      <PaymentSection
        acompteVerse={formData.acompte_verse}
        montantTTC={montantTTC}
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
        montantTTC={montantTTC}
        resteAPayer={montantTTC - (formData.acompte_verse + nouvelAcompte)}
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
