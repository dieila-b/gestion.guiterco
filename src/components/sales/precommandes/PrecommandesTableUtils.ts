
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PrecommandeComplete } from '@/types/precommandes';

export const getDisponibiliteEstimee = (precommande: PrecommandeComplete) => {
  if (precommande.date_livraison_prevue) {
    return format(new Date(precommande.date_livraison_prevue), 'dd/MM/yyyy', { locale: fr });
  }
  return 'Non définie';
};

export const peutConvertirEnVente = (statut: string) => {
  return ['prete', 'confirmee'].includes(statut);
};

export const peutFinaliserPaiement = (precommande: PrecommandeComplete) => {
  const montantTotal = calculerTotalPrecommande(precommande);
  const acompteVerse = precommande.acompte_verse || 0;
  return acompteVerse > 0 && acompteVerse < montantTotal && ['prete', 'confirmee'].includes(precommande.statut);
};

export const calculerTotalPrecommande = (precommande: PrecommandeComplete) => {
  return precommande.lignes_precommande?.reduce((sum, ligne) => sum + ligne.montant_ligne, 0) || 0;
};

export const calculerResteAPayer = (precommande: PrecommandeComplete) => {
  const total = calculerTotalPrecommande(precommande);
  return total - (precommande.acompte_verse || 0);
};
