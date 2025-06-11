
import React from 'react';
import { Button } from '@/components/ui/button';
import { BasicInfoSection } from './form/BasicInfoSection';
import { StatusSection } from './form/StatusSection';
import { ArticlesSection } from './form/ArticlesSection';
import { FeesSection } from './form/FeesSection';
import { SummarySection } from './form/SummarySection';
import { NotesSection } from './form/NotesSection';
import { useBonCommandeForm } from '@/hooks/useBonCommandeForm';

interface CreateBonCommandeFormProps {
  onSuccess: () => void;
}

export const CreateBonCommandeForm = ({ onSuccess }: CreateBonCommandeFormProps) => {
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
    createBonCommande,
    setMontantPaye,
    handleRefreshFournisseurs,
    ajouterArticle,
    modifierQuantite,
    modifierPrix,
    supprimerArticle,
    onSubmit
  } = useBonCommandeForm(onSuccess);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" disabled={createBonCommande.isPending}>
          {createBonCommande.isPending ? 'Création...' : 'Créer le bon de commande'}
        </Button>
      </div>
    </form>
  );
};
