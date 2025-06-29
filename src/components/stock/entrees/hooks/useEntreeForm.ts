
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'emplacement_type') {
        newData.entrepot_id = '';
        newData.point_vente_id = '';
      }
      
      return newData;
    });
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

    return true;
  };

  const resetForm = () => {
    setFormData(initialFormData);
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
    handleInputChange,
    handleSelectChange,
    handleEmplacementChange,
    validateForm,
    resetForm,
    getEntreeData
  };
};
