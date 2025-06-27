
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PrecommandeComplete, LignePrecommandeComplete } from '@/types/precommandes';

type StatutType = 'confirmee' | 'en_preparation' | 'prete' | 'partiellement_livree' | 'livree' | 'annulee' | 'convertie_en_vente';
type StatutLivraisonType = 'en_attente' | 'partiellement_livree' | 'livree';

interface PrecommandeFormLogicProps {
  precommande: PrecommandeComplete;
}

export const usePrecommandeFormLogic = ({ precommande }: PrecommandeFormLogicProps) => {
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

  return {
    formData,
    setFormData,
    nouvelAcompte,
    setNouvelAcompte,
    lignes,
    setLignes,
    isLoadingLignes,
    handleLigneChange,
    handleDeleteLigne,
    handleAddLigne,
    calculateTotals,
    calculateDeliveryStatus
  };
};
