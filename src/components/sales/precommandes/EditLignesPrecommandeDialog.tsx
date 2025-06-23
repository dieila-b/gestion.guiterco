
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditLignesForm } from './edit-lignes/useEditLignesForm';
import AddArticleSection from './edit-lignes/AddArticleSection';
import ArticlesTable from './edit-lignes/ArticlesTable';
import PrecommandeSummary from './edit-lignes/PrecommandeSummary';
import type { PrecommandeComplete } from '@/types/precommandes';

interface EditLignesPrecommandeDialogProps {
  precommande: PrecommandeComplete | null;
  open: boolean;
  onClose: () => void;
}

const EditLignesPrecommandeDialog = ({ precommande, open, onClose }: EditLignesPrecommandeDialogProps) => {
  const {
    lignes,
    nouvelleArticle,
    setNouvelleArticle,
    catalogue,
    articlesDisponibles,
    updateLignes,
    handleAddArticle,
    handleUpdateLigne,
    handleDeleteLigne,
    handleSave
  } = useEditLignesForm(precommande);

  const handleSaveAndClose = async () => {
    await handleSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Éditer les articles - {precommande?.numero_precommande}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <AddArticleSection
            nouvelleArticle={nouvelleArticle}
            setNouvelleArticle={setNouvelleArticle}
            articlesDisponibles={articlesDisponibles}
            onAddArticle={handleAddArticle}
          />

          <ArticlesTable
            lignes={lignes}
            catalogue={catalogue}
            onUpdateLigne={handleUpdateLigne}
            onDeleteLigne={handleDeleteLigne}
          />

          <PrecommandeSummary lignes={lignes} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateLignes.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSaveAndClose} disabled={updateLignes.isPending}>
            {updateLignes.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLignesPrecommandeDialog;
