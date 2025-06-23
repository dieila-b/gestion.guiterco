
import { useState, useEffect } from 'react';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useUpdateLignesPrecommande } from '@/hooks/precommandes/useUpdateLignesPrecommande';
import type { PrecommandeComplete } from '@/types/precommandes';

interface LigneEdition {
  id?: string;
  article_id: string;
  quantite: number;
  quantite_livree: number;
  prix_unitaire: number;
  statut_ligne: string;
  isNew?: boolean;
}

export const useEditLignesForm = (precommande: PrecommandeComplete | null) => {
  const { articles: catalogue } = useCatalogue();
  const updateLignes = useUpdateLignesPrecommande();
  const [lignes, setLignes] = useState<LigneEdition[]>([]);
  const [nouvelleArticle, setNouvelleArticle] = useState('');

  useEffect(() => {
    if (precommande && precommande.lignes_precommande) {
      setLignes(precommande.lignes_precommande.map(ligne => ({
        id: ligne.id,
        article_id: ligne.article_id,
        quantite: ligne.quantite,
        quantite_livree: ligne.quantite_livree || 0,
        prix_unitaire: ligne.prix_unitaire,
        statut_ligne: ligne.statut_ligne || 'en_attente'
      })));
    }
  }, [precommande]);

  const handleAddArticle = () => {
    if (!nouvelleArticle) return;
    
    const article = catalogue?.find(a => a.id === nouvelleArticle);
    if (!article) return;

    const nouvelleLigne: LigneEdition = {
      article_id: nouvelleArticle,
      quantite: 1,
      quantite_livree: 0,
      prix_unitaire: article.prix_vente || 0,
      statut_ligne: 'en_attente',
      isNew: true
    };

    setLignes([...lignes, nouvelleLigne]);
    setNouvelleArticle('');
  };

  const handleUpdateLigne = (index: number, field: keyof LigneEdition, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    
    // Mettre à jour le statut selon la livraison
    if (field === 'quantite_livree') {
      const ligne = newLignes[index];
      if (ligne.quantite_livree === 0) {
        ligne.statut_ligne = 'en_attente';
      } else if (ligne.quantite_livree < ligne.quantite) {
        ligne.statut_ligne = 'partiellement_livree';
      } else if (ligne.quantite_livree >= ligne.quantite) {
        ligne.statut_ligne = 'livree';
      }
    }
    
    setLignes(newLignes);
  };

  const handleDeleteLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!precommande) return;

    try {
      await updateLignes.mutateAsync({
        precommande_id: precommande.id,
        lignes: lignes.map(ligne => ({
          id: ligne.id,
          article_id: ligne.article_id,
          quantite: ligne.quantite,
          quantite_livree: ligne.quantite_livree,
          prix_unitaire: ligne.prix_unitaire,
          statut_ligne: ligne.statut_ligne,
          montant_ligne: ligne.quantite * ligne.prix_unitaire
        }))
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const articlesDisponibles = catalogue?.filter(article => 
    !lignes.some(ligne => ligne.article_id === article.id)
  ) || [];

  return {
    lignes,
    nouvelleArticle,
    setNouvelleArticle,
    catalogue,
    articlesDisponibles,
    updateLignes,
    handleAddArticle,
    handleUpdateLigne,
    handleDeleteLigne,
    handleSave
  };
};
