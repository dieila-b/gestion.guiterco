
import { ArticleLigne } from './types';

export const createArticleLigne = (article: { id: string; nom: string; prix_achat?: number }): ArticleLigne => {
  const prixUnitaire = article.prix_achat || 0;
  return {
    article_id: article.id,
    nom: article.nom,
    quantite: 1,
    prix_unitaire: Math.round(prixUnitaire),
    montant_ligne: Math.round(prixUnitaire),
  };
};

export const updateQuantite = (articlesLignes: ArticleLigne[], index: number, quantite: number): ArticleLigne[] => {
  const nouveauxArticles = [...articlesLignes];
  nouveauxArticles[index].quantite = quantite;
  nouveauxArticles[index].montant_ligne = Math.round(quantite * nouveauxArticles[index].prix_unitaire);
  return nouveauxArticles;
};

export const updatePrix = (articlesLignes: ArticleLigne[], index: number, prix: number): ArticleLigne[] => {
  const nouveauxArticles = [...articlesLignes];
  const prixArrondi = Math.round(prix);
  nouveauxArticles[index].prix_unitaire = prixArrondi;
  nouveauxArticles[index].montant_ligne = Math.round(prixArrondi * nouveauxArticles[index].quantite);
  return nouveauxArticles;
};

export const removeArticle = (articlesLignes: ArticleLigne[], index: number): ArticleLigne[] => {
  return articlesLignes.filter((_, i) => i !== index);
};
