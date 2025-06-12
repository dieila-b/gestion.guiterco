
import { ArticleLigne } from './types';

export const calculateSousTotal = (articlesLignes: ArticleLigne[]): number => {
  return Math.round(articlesLignes.reduce((sum, article) => sum + article.montant_ligne, 0));
};

export const calculateMontantHT = (
  sousTotal: number,
  remise: number,
  fraisLivraison: number,
  fraisLogistique: number,
  transitDouane: number
): number => {
  return Math.round(sousTotal - remise + fraisLivraison + fraisLogistique + transitDouane);
};

export const calculateTVA = (montantHT: number, tauxTva: number): number => {
  return Math.round(montantHT * (tauxTva / 100));
};

export const calculateMontantTTC = (montantHT: number, tva: number): number => {
  return Math.round(montantHT + tva);
};

export const calculateResteAPayer = (montantTTC: number, montantPaye: number): number => {
  return Math.round(montantTTC - montantPaye);
};
