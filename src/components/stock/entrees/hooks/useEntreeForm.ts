
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface FormData {
  article_id: string;
  entrepot_id: string;
  point_vente_id: string;
  emplacement_type: string;
  quantite: number;
  type_entree: string;
  numero_bon: string;
  fournisseur: string;
  prix_unitaire: number;
  observations: string;
  created_by: string;
}

const initialFormData: FormData = {
  article_id: '',
  entrepot_id: '',
  point_vente_id: '',
  emplacement_type: 'entrepot',
  quantite: 0,
  type_entree: 'achat',
  numero_bon: '',
  fournisseur: '',
  prix_unitaire: 0,
  observations: '',
  created_by: 'Utilisateur'
};

export const useEntreeForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Réinitialiser l'avertissement si l'utilisateur modifie les données
    if (duplicateWarning) {
      setDuplicateWarning('');
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'emplacement_type') {
        newData.entrepot_id = '';
        newData.point_vente_id = '';
      }
      
      // Validation renforcée pour le type d'entrée
      if (name === 'type_entree') {
        if (value === 'correction') {
          // Pour les corrections, les observations sont fortement recommandées
          if (!prev.observations) {
            toast({
              title: "Information",
              description: "Pour une correction, veuillez indiquer le motif dans les observations",
              variant: "default",
            });
          }
        } else if (value === 'achat') {
          // Pour les achats, un fournisseur est requis
          if (!prev.fournisseur) {
            toast({
              title: "Information",
              description: "Pour un achat, veuillez indiquer le fournisseur",
              variant: "default",
            });
          }
        }
      }
      
      return newData;
    });
    
    // Réinitialiser l'avertissement si l'utilisateur modifie le type
    if (name === 'type_entree' && duplicateWarning) {
      setDuplicateWarning('');
    }
  };

  const handleEmplacementChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      entrepot_id: prev.emplacement_type === 'entrepot' ? value : '',
      point_vente_id: prev.emplacement_type === 'point_vente' ? value : ''
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.article_id || formData.quantite <= 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.entrepot_id && !formData.point_vente_id) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un emplacement",
        variant: "destructive",
      });
      return false;
    }

    // Validation spécifique selon le type d'entrée
    if (formData.type_entree === 'achat' && !formData.fournisseur.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Un fournisseur est obligatoire pour un achat",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type_entree === 'correction' && !formData.observations.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Des observations sont obligatoires pour une correction de stock",
        variant: "destructive",
      });
      return false;
    }

    if (formData.type_entree === 'transfert' && !formData.numero_bon.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Un numéro de bon est obligatoire pour un transfert",
        variant: "destructive",
      });
      return false;
    }

    // PROTECTION RENFORCÉE: Empêcher toute tentative de correction automatique
    if (formData.type_entree === 'correction' && (
        formData.fournisseur.includes('Réception') ||
        formData.fournisseur.includes('bon') ||
        formData.observations.includes('automatique') ||
        formData.observations.includes('Réception') ||
        formData.observations.includes('BL') ||
        formData.numero_bon.startsWith('BL-')
    )) {
      toast({
        title: "❌ Type d'entrée non autorisé",
        description: "CRÉATION DE CORRECTION AUTOMATIQUE INTERDITE - Utilisez uniquement le type 'achat' pour les réceptions de bons de livraison.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setDuplicateWarning('');
  };

  const getEntreeData = () => ({
    article_id: formData.article_id,
    entrepot_id: formData.entrepot_id || null,
    point_vente_id: formData.point_vente_id || null,
    quantite: Number(formData.quantite),
    type_entree: formData.type_entree,
    numero_bon: formData.numero_bon || null,
    fournisseur: formData.fournisseur || null,
    prix_unitaire: formData.prix_unitaire ? Number(formData.prix_unitaire) : null,
    observations: formData.observations || null,
    created_by: formData.created_by
  });

  return {
    formData,
    duplicateWarning,
    setDuplicateWarning,
    handleInputChange,
    handleSelectChange,
    handleEmplacementChange,
    validateForm,
    resetForm,
    getEntreeData
  };
};
