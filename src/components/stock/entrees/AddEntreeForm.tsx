
import React from 'react';
import { useCatalogue, useEntrepots, usePointsDeVente, useEntreesStock } from '@/hooks/stock';
import { Button } from '@/components/ui/button';
import { ArticleSection } from './form/ArticleSection';
import { LocationSection } from './form/LocationSection';
import { QuantityAndTypeSection } from './form/QuantityAndTypeSection';
import { SupplierAndDocSection } from './form/SupplierAndDocSection';
import { PriceAndNotesSection } from './form/PriceAndNotesSection';
import { useEntreeForm } from './hooks/useEntreeForm';

interface AddEntreeFormProps {
  onSuccess: () => void;
}

export const AddEntreeForm = ({ onSuccess }: AddEntreeFormProps) => {
  const { createEntree } = useEntreesStock();
  const { articles } = useCatalogue();
  const { entrepots } = useEntrepots();
  const { pointsDeVente } = usePointsDeVente();

  const {
    formData,
    handleInputChange,
    handleSelectChange,
    handleEmplacementChange,
    validateForm,
    resetForm,
    getEntreeData
  } = useEntreeForm();

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
      />

      <PriceAndNotesSection
        prixUnitaire={formData.prix_unitaire}
        observations={formData.observations}
        onInputChange={handleInputChange}
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
