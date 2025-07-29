-- Créer une vue matérialisée pour les marges articles si elle n'existe pas déjà comme table
CREATE OR REPLACE VIEW public.vue_marges_frais AS
SELECT 
    c.id,
    c.nom,
    c.reference,
    c.prix_achat,
    c.prix_vente,
    c.frais_logistique,
    c.frais_douane,
    c.frais_transport,
    c.autres_frais,
    COALESCE(c.frais_bon_commande, 0) as frais_bon_commande,
    (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
     COALESCE(c.autres_frais, 0) + COALESCE(c.frais_bon_commande, 0)) as cout_total_unitaire,
    (COALESCE(c.prix_vente, 0) - (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
     COALESCE(c.autres_frais, 0) + COALESCE(c.frais_bon_commande, 0))) as marge_unitaire,
    CASE 
        WHEN (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
              COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
              COALESCE(c.autres_frais, 0) + COALESCE(c.frais_bon_commande, 0)) > 0
        THEN ROUND(((COALESCE(c.prix_vente, 0) - (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
                     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
                     COALESCE(c.autres_frais, 0) + COALESCE(c.frais_bon_commande, 0))) / 
                    (COALESCE(c.prix_achat, 0) + COALESCE(c.frais_logistique, 0) + 
                     COALESCE(c.frais_douane, 0) + COALESCE(c.frais_transport, 0) + 
                     COALESCE(c.autres_frais, 0) + COALESCE(c.frais_bon_commande, 0))) * 100, 2)
        ELSE 0
    END as taux_marge,
    c.created_at,
    c.updated_at
FROM public.catalogue c
WHERE c.statut = 'actif';