
import React from 'react';
import { useCatalogue, useEntrepots, usePointsDeVente, useEntreesStock } from '@/hooks/stock';
import { Button } from '@/components/ui/button';
import { ArticleSection } from './form/ArticleSection';
import { LocationSection } from './form/LocationSection';
import { QuantityAndTypeSection } from './form/QuantityAndTypeSection';
import { SupplierAndDocSection } from './form/SupplierAndDocSection';
import { PriceAndNotesSection } from './form/PriceAndNotesSection';
import { DuplicateAlert } from './DuplicateAlert';
import { useEntreeForm } from './hooks/useEntreeForm';

interface AddEntreeFormProps {
  onSuccess: () => void;
}

export const AddEntreeForm = ({ onSuccess }: AddEntreeFormProps) => {
  const { createEntree, checkForDuplicates } = useEntreesStock();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();

  const {
    formData,
    duplicateWarning,
    setDuplicateWarning,
    handleInputChange,
    handleSelectChange,
    handleEmplacementChange,
    validateForm,
    resetForm,
    getEntreeData
  } = useEntreeForm();

  // Vérifier les doublons potentiels lorsque l'utilisateur saisit les données principales
  React.useEffect(() => {
    const checkDuplicates = async () => {
      if (formData.article_id && formData.quantite > 0 && 
          (formData.entrepot_id || formData.point_vente_id)) {
        try {
          const entreeData = getEntreeData();
          const duplicates = await checkForDuplicates(entreeData);
          
          if (duplicates.length > 0) {
            const duplicateTypes = duplicates.map(d => d.type_entree).join(', ');
            setDuplicateWarning(
              `⚠️ Attention : Une entrée similaire existe déjà aujourd'hui (types: ${duplicateTypes}). Vérifiez qu'il ne s'agit pas d'un doublon.`
            );
          } else {
            setDuplicateWarning('');
          }
        } catch (error) {
          console.log('Vérification des doublons:', error);
        }
      }
    };

    const debounceTimer = setTimeout(checkDuplicates, 1000);
    return () => clearTimeout(debounceTimer);
  }, [formData.article_id, formData.quantite, formData.entrepot_id, formData.point_vente_id, formData.type_entree]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const entreeData = getEntreeData();
      await createEntree.mutateAsync(entreeData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout d'entrée:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <DuplicateAlert 
        message={duplicateWarning} 
        onDismiss={() => setDuplicateWarning('')} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <ArticleSection
          articleId={formData.article_id}
          articles={articles}
          onArticleChange={(value) => handleSelectChange('article_id', value)}
        />
      </div>

      <LocationSection
        emplacementType={formData.emplacement_type}
        entrepotId={formData.entrepot_id}
        pointVenteId={formData.point_vente_id}
        entrepots={entrepots}
        pointsDeVente={pointsDeVente}
        onEmplacementTypeChange={(value) => handleSelectChange('emplacement_type', value)}
        onEmplacementChange={handleEmplacementChange}
      />

      <QuantityAndTypeSection
        quantite={formData.quantite}
        typeEntree={formData.type_entree}
        onInputChange={handleInputChange}
        onTypeEntreeChange={(value) => handleSelectChange('type_entree', value)}
      />

      <SupplierAndDocSection
        numeroBon={formData.numero_bon}
        fournisseur={formData.fournisseur}
        onInputChange={handleInputChange}
        isSupplierRequired={formData.type_entree === 'achat'}
      />

      <PriceAndNotesSection
        prixUnitaire={formData.prix_unitaire}
        observations={formData.observations}
        onInputChange={handleInputChange}
        isObservationsRequired={formData.type_entree === 'correction'}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Annuler
        </Button>
        <Button type="submit" disabled={createEntree.isPending}>
          {createEntree.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};
