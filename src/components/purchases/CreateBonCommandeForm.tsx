
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Gestion de la soumission du formulaire');
    console.log('📊 État du formulaire:', form.getValues());
    console.log('📦 Articles sélectionnés:', articlesLignes);
    
    // Utiliser handleSubmit du hook form pour valider et soumettre
    form.handleSubmit(onSubmit)(e);
  };

  const isFormValid = () => {
    const values = form.getValues();
    return values.fournisseur_id && articlesLignes.length > 0;
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
          surestaries={Math.round(form.watch('surestaries') || 0)}
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
        <Button 
          type="submit" 
          disabled={createBonCommande.isPending || !isFormValid()}
          className="min-w-[200px]"
        >
          {createBonCommande.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Création en cours...</span>
            </div>
          ) : (
            'Créer le bon de commande'
          )}
        </Button>
      </div>
    </form>
  );
};
