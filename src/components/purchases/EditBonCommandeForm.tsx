
import React from 'react';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from './form/BasicInfoSection';
import { StatusSection } from './form/StatusSection';
import { ArticlesSection } from './form/ArticlesSection';
import { FeesSection } from './form/FeesSection';
import { SummarySection } from './form/SummarySection';
import { NotesSection } from './form/NotesSection';
import { useEditBonCommandeForm } from '@/hooks/useEditBonCommandeForm';

interface EditBonCommandeFormProps {
  bon: any;
  onSuccess: () => void;
}

export const EditBonCommandeForm = ({ bon, onSuccess }: EditBonCommandeFormProps) => {
  const {
    form,
    fournisseurs,
    articles,
    loadingFournisseurs,
    loadingArticles,
    refreshingFournisseurs,
    articlesLignes,
    montantPaye,
    sousTotal,
    remise,
    fraisLivraison,
    fraisLogistique,
    transitDouane,
    tauxTva,
    montantHT,
    tva,
    montantTTC,
    resteAPayer,
    updateBonCommande,
    setMontantPaye,
    handleRefreshFournisseurs,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    supprimerArticle,
    onSubmit
  } = useEditBonCommandeForm(bon, onSuccess);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Gestion de la mise à jour du formulaire');
    
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BasicInfoSection
          form={form}
          fournisseurs={fournisseurs}
          loadingFournisseurs={loadingFournisseurs}
          refreshingFournisseurs={refreshingFournisseurs}
          onRefreshFournisseurs={handleRefreshFournisseurs}
        />

        <StatusSection
          form={form}
          montantPaye={montantPaye}
          setMontantPaye={setMontantPaye}
        />
      </div>

      <ArticlesSection
        articles={articles}
        loadingArticles={loadingArticles}
        articlesLignes={articlesLignes}
        onAjouterArticle={ajouterArticle}
        onModifierQuantite={modifierQuantite}
        onModifierPrix={modifierPrix}
        onSupprimerArticle={supprimerArticle}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeesSection form={form} />

        <SummarySection
          sousTotal={sousTotal}
          remise={remise}
          fraisLivraison={fraisLivraison}
          fraisLogistique={fraisLogistique}
          transitDouane={transitDouane}
          montantHT={montantHT}
          tauxTva={tauxTva}
          tva={tva}
          montantTTC={montantTTC}
          montantPaye={montantPaye}
          resteAPayer={resteAPayer}
        />
      </div>

      <NotesSection form={form} />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={updateBonCommande.isPending}>
          {updateBonCommande.isPending ? 'Mise à jour...' : 'Mettre à jour le bon de commande'}
        </Button>
      </div>
    </form>
  );
};
