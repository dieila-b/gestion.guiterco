
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ArticleOptimized } from '@/hooks/useCatalogueOptimized';
import { useEditProductForm } from '@/hooks/useEditProductForm';
import CreateProductForm from './CreateProductForm';

interface EditProductDialogProps {
  article: ArticleOptimized;
}

export const EditProductDialog = ({ article }: EditProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, loading, handleSubmit, updateFormData } = useEditProductForm(article);

  const handleClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = async (data: any) => {
    // Adapter les données du formulaire de création pour la mise à jour
    updateFormData({
      nom: data.nom || formData.nom,
      description: data.description || formData.description,
      prix_achat: data.prix_achat?.toString() || formData.prix_achat,
      prix_vente: data.prix_vente?.toString() || formData.prix_vente,
      frais_logistique: data.frais_logistique?.toString() || formData.frais_logistique,
      frais_douane: data.frais_douane?.toString() || formData.frais_douane,
      frais_transport: data.frais_transport?.toString() || formData.frais_transport,
      autres_frais: data.autres_frais?.toString() || formData.autres_frais,
      categorie_id: data.categorie_id || formData.categorie_id,
      unite_id: data.unite_id || formData.unite_id,
      seuil_alerte: data.seuil_alerte?.toString() || formData.seuil_alerte,
      image_url: data.image_url || formData.image_url
    });

    // Créer un faux événement pour la fonction handleSubmit existante
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    const success = await handleSubmit(fakeEvent);
    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        title="Éditer"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={updateFormData}
          onCancel={handleClose}
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};
