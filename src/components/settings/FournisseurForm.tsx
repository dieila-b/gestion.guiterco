
import React from 'react';
import { Button } from "@/components/ui/button";
import { Fournisseur } from '@/types/fournisseurs';
import { useFournisseurForm } from '@/hooks/useFournisseurForm';
import FormFieldsSection from './fournisseur-form/FormFieldsSection';
import LocationSection from './fournisseur-form/LocationSection';
import ContactSection from './fournisseur-form/ContactSection';
import AddressSection from './fournisseur-form/AddressSection';

interface FournisseurFormProps {
  fournisseur?: Fournisseur;
  onSubmit: (data: Partial<Fournisseur>) => void;
  onCancel: () => void;
}

const FournisseurForm: React.FC<FournisseurFormProps> = ({ fournisseur, onSubmit, onCancel }) => {
  const {
    formData,
    updateFormData,
    selectedPays,
    villes,
    useCustomVille,
    setUseCustomVille,
    handlePaysChange,
    handleTelephoneChange
  } = useFournisseurForm(fournisseur);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      ville_id: useCustomVille ? null : formData.ville_id,
      ville_personnalisee: useCustomVille ? formData.ville_personnalisee : null
    };
    onSubmit(submitData);
  };

  const handleVilleChange = (villeId: string) => {
    updateFormData({ ville_id: villeId });
  };

  const handleVillePersonnaliseeChange = (ville: string) => {
    updateFormData({ ville_personnalisee: ville });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormFieldsSection 
          formData={formData}
          onUpdate={updateFormData}
        />

        <LocationSection
          formData={formData}
          villes={villes}
          useCustomVille={useCustomVille}
          onPaysChange={handlePaysChange}
          onVilleChange={handleVilleChange}
          onVillePersonnaliseeChange={handleVillePersonnaliseeChange}
          onCustomVilleToggle={setUseCustomVille}
        />

        <ContactSection
          formData={formData}
          selectedPays={selectedPays}
          onTelephoneChange={handleTelephoneChange}
          onUpdate={updateFormData}
        />

        <AddressSection
          formData={formData}
          onUpdate={updateFormData}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {fournisseur ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default FournisseurForm;
