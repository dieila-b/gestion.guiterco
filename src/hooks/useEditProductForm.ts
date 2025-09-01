
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArticleOptimized } from '@/hooks/useCatalogueOptimized';

interface EditFormData {
  nom: string;
  reference: string;
  description: string;
  prix_achat: string;
  prix_vente: string;
  frais_logistique: string;
  frais_douane: string;
  frais_transport: string;
  autres_frais: string;
  categorie_id: string;
  unite_id: string;
  seuil_alerte: string;
  image_url: string;
}

export const useEditProductForm = (article: ArticleOptimized) => {
  const [formData, setFormData] = useState<EditFormData>({
    nom: '',
    reference: '',
    description: '',
    prix_achat: '',
    prix_vente: '',
    frais_logistique: '',
    frais_douane: '',
    frais_transport: '',
    autres_frais: '',
    categorie_id: '',
    unite_id: '',
    seuil_alerte: '10',
    image_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Charger les données complètes de l'article
  useEffect(() => {
    const loadCompleteArticleData = async () => {
      if (!article?.id || dataLoaded) return;
      
      try {
        console.log('Chargement des données complètes pour l\'article:', article.id);
        
        const { data, error } = await supabase
          .from('catalogue')
          .select(`
            *,
            categories_catalogue(id, nom),
            unites(id, nom, symbole)
          `)
          .eq('id', article.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement des données complètes:', error);
          // Utiliser les données de base si l'appel échoue
          setFormData({
            nom: article.nom || '',
            reference: article.reference || '',
            description: article.description || '',
            prix_achat: article.prix_achat?.toString() || '',
            prix_vente: article.prix_vente?.toString() || '',
            frais_logistique: '',
            frais_douane: '',
            frais_transport: '',
            autres_frais: '',
            categorie_id: article.categorie_id || '',
            unite_id: article.unite_id || '',
            seuil_alerte: article.seuil_alerte?.toString() || '10',
            image_url: article.image_url || ''
          });
          setDataLoaded(true);
          return;
        }

        console.log('Données complètes chargées:', data);
        
        setFormData({
          nom: data.nom || '',
          reference: data.reference || '',
          description: data.description || '',
          prix_achat: data.prix_achat?.toString() || '',
          prix_vente: data.prix_vente?.toString() || '',
          frais_logistique: data.frais_logistique?.toString() || '',
          frais_douane: data.frais_douane?.toString() || '',
          frais_transport: data.frais_transport?.toString() || '',
          autres_frais: data.autres_frais?.toString() || '',
          categorie_id: data.categorie_id || '',
          unite_id: data.unite_id || '',
          seuil_alerte: data.seuil_alerte?.toString() || '10',
          image_url: data.image_url || ''
        });

        setDataLoaded(true);
        console.log('Formulaire pré-rempli avec:', formData);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setDataLoaded(true);
      }
    };

    loadCompleteArticleData();
  }, [article?.id, dataLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Mise à jour du produit avec les données:', formData);
      
      // Validation côté client
      if (!formData.nom || formData.nom.trim() === '') {
        throw new Error('Le nom du produit est obligatoire');
      }
      if (!formData.reference || formData.reference.trim() === '') {
        throw new Error('La référence du produit est obligatoire');
      }

      // Préparer les données à mettre à jour
      const updateData: any = {
        nom: formData.nom.trim(),
        reference: formData.reference.trim(),
        seuil_alerte: parseInt(formData.seuil_alerte) || 10,
        updated_at: new Date().toISOString()
      };

      // Ajouter la description
      if (formData.description && formData.description.trim() !== '') {
        updateData.description = formData.description.trim();
      } else {
        updateData.description = null;
      }

      // Ajouter les prix
      if (formData.prix_achat && formData.prix_achat.trim() !== '') {
        const prixAchat = parseFloat(formData.prix_achat);
        if (!isNaN(prixAchat) && prixAchat >= 0) {
          updateData.prix_achat = prixAchat;
        } else {
          updateData.prix_achat = null;
        }
      } else {
        updateData.prix_achat = null;
      }
      
      if (formData.prix_vente && formData.prix_vente.trim() !== '') {
        const prixVente = parseFloat(formData.prix_vente);
        if (!isNaN(prixVente) && prixVente >= 0) {
          updateData.prix_vente = prixVente;
        } else {
          updateData.prix_vente = null;
        }
      } else {
        updateData.prix_vente = null;
      }

      // Ajouter les frais
      ['frais_logistique', 'frais_douane', 'frais_transport', 'autres_frais'].forEach(field => {
        const value = formData[field as keyof EditFormData];
        if (value && value.trim() !== '') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue >= 0) {
            updateData[field] = numValue;
          } else {
            updateData[field] = null;
          }
        } else {
          updateData[field] = null;
        }
      });

      // Ajouter les relations
      if (formData.categorie_id && formData.categorie_id.trim() !== '') {
        updateData.categorie_id = formData.categorie_id;
      } else {
        updateData.categorie_id = null;
      }
      
      if (formData.unite_id && formData.unite_id.trim() !== '') {
        updateData.unite_id = formData.unite_id;
      } else {
        updateData.unite_id = null;
      }

      // Ajouter l'image
      if (formData.image_url && formData.image_url.trim() !== '') {
        updateData.image_url = formData.image_url.trim();
      } else {
        updateData.image_url = null;
      }

      console.log('Données préparées pour mise à jour:', updateData);

      // Mettre à jour le produit
      const { data, error } = await supabase
        .from('catalogue')
        .update(updateData)
        .eq('id', article.id)
        .select();

      if (error) {
        console.error('Erreur Supabase détaillée:', error);
        throw error;
      }

      console.log('Produit mis à jour avec succès:', data);

      toast({
        title: "Produit modifié",
        description: `Le produit "${formData.nom}" a été mis à jour avec succès.`
      });

      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['catalogue_optimized'] });

      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      
      let errorMessage = "Impossible de modifier le produit.";
      
      if (error.code === '23505') {
        if (error.message?.includes('reference')) {
          errorMessage = "Cette référence existe déjà.";
        } else {
          errorMessage = "Un produit avec ces informations existe déjà.";
        }
      } else if (error.code === '23502') {
        errorMessage = "Certains champs obligatoires sont manquants.";
      } else if (error.code === '23503') {
        errorMessage = "Catégorie ou unité invalide sélectionnée.";
      } else if (error.message) {
        errorMessage = error.message;
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

  const updateFormData = (updates: Partial<EditFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    loading: loading || !dataLoaded,
    handleSubmit,
    updateFormData,
    dataLoaded
  };
};
