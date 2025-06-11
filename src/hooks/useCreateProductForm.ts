
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  nom: string;
  description: string;
  prix_achat: string;
  prix_vente: string;
  categorie_id: string;
  unite_id: string;
  seuil_alerte: string;
  image_url: string;
}

const initialFormData: FormData = {
  nom: '',
  description: '',
  prix_achat: '',
  prix_vente: '',
  categorie_id: '',
  unite_id: '',
  seuil_alerte: '10',
  image_url: ''
};

export const useCreateProductForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insérer avec une référence temporaire que le trigger remplacera
      const { error } = await supabase
        .from('catalogue')
        .insert({
          nom: formData.nom,
          reference: 'TEMP', // Référence temporaire - sera remplacée par le trigger
          description: formData.description || null,
          prix_achat: formData.prix_achat ? parseFloat(formData.prix_achat) : null,
          prix_vente: formData.prix_vente ? parseFloat(formData.prix_vente) : null,
          categorie_id: formData.categorie_id || null,
          unite_id: formData.unite_id || null,
          seuil_alerte: parseInt(formData.seuil_alerte),
          image_url: formData.image_url || null
        });

      if (error) throw error;

      toast({
        title: "Produit créé",
        description: "Le produit a été ajouté au catalogue avec succès."
      });

      setFormData(initialFormData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return {
    formData,
    loading,
    handleSubmit,
    updateFormData,
    resetForm
  };
};
