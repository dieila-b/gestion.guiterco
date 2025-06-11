
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
      console.log('Tentative de création du produit avec les données:', formData);
      
      // Préparer les données à insérer
      const insertData: any = {
        nom: formData.nom.trim(),
        description: formData.description.trim() || null,
        seuil_alerte: parseInt(formData.seuil_alerte) || 10
      };

      // Ajouter les prix seulement s'ils sont renseignés
      if (formData.prix_achat && formData.prix_achat.trim() !== '') {
        insertData.prix_achat = parseFloat(formData.prix_achat);
      }
      
      if (formData.prix_vente && formData.prix_vente.trim() !== '') {
        insertData.prix_vente = parseFloat(formData.prix_vente);
      }

      // Ajouter les relations seulement si elles sont sélectionnées
      if (formData.categorie_id && formData.categorie_id.trim() !== '') {
        insertData.categorie_id = formData.categorie_id;
      }
      
      if (formData.unite_id && formData.unite_id.trim() !== '') {
        insertData.unite_id = formData.unite_id;
      }

      // Ajouter l'image seulement si elle est fournie
      if (formData.image_url && formData.image_url.trim() !== '') {
        insertData.image_url = formData.image_url;
      }

      console.log('Données préparées pour insertion:', insertData);

      // Insérer le produit (la référence sera générée automatiquement par le trigger)
      const { data, error } = await supabase
        .from('catalogue')
        .insert(insertData)
        .select('*');

      if (error) {
        console.error('Erreur Supabase détaillée:', error);
        throw error;
      }

      console.log('Produit créé avec succès:', data);

      toast({
        title: "Produit créé",
        description: `Le produit "${formData.nom}" a été ajouté au catalogue avec succès.`
      });

      setFormData(initialFormData);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      
      let errorMessage = "Impossible de créer le produit.";
      
      if (error.code === '23505') {
        errorMessage = "Cette référence existe déjà. Veuillez réessayer.";
      } else if (error.code === '23502') {
        errorMessage = "Certains champs obligatoires sont manquants.";
      } else if (error.code === '23503') {
        errorMessage = "Catégorie ou unité invalide.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
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
