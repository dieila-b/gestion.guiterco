
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateProductForm } from '@/hooks/useCreateProductForm';
import CreateProductForm from './CreateProductForm';

const CreateProductDialog = () => {
  const [open, setOpen] = useState(false);
  const { formData, loading, handleSubmit, updateFormData, resetForm } = useCreateProductForm();

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      handleClose();
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Produit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau produit</DialogTitle>
        </DialogHeader>
        <CreateProductForm
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={updateFormData}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductDialog;
