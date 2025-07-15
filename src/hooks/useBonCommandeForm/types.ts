
import * as z from 'zod';

export const bonCommandeSchema = z.object({
  fournisseur_id: z.string().min(1, 'Le fournisseur est requis'),
  date_commande: z.string().min(1, 'La date est requise'),
  date_livraison_prevue: z.string().optional(),
  statut: z.string().default('en_cours'),
  statut_paiement: z.string().default('en_attente'),
  remise: z.number().min(0).default(0),
  frais_livraison: z.number().min(0).default(0),
  frais_logistique: z.number().min(0).default(0),
  transit_douane: z.number().min(0).default(0),
  surstaries: z.number().min(0).default(0),
  taux_tva: z.number().min(0).max(100).default(20),
  observations: z.string().optional(),
});

export type BonCommandeForm = z.infer<typeof bonCommandeSchema>;

export interface ArticleLigne {
  article_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  montant_ligne: number;
}
