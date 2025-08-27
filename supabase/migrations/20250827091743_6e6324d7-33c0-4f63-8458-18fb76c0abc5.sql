-- Synchroniser les articles existants pour les bons de livraison qui n'ont pas d'articles
-- mais qui ont un bon_commande_id
INSERT INTO public.articles_bon_livraison (
    bon_livraison_id,
    article_id,
    quantite_commandee,
    quantite_recue,
    prix_unitaire,
    montant_ligne,
    created_at,
    updated_at
)
SELECT 
    bl.id as bon_livraison_id,
    abc.article_id,
    abc.quantite as quantite_commandee,
    0 as quantite_recue, -- Par défaut, rien n'est encore reçu
    abc.prix_unitaire,
    abc.montant_ligne,
    now() as created_at,
    now() as updated_at
FROM public.bons_de_livraison bl
JOIN public.articles_bon_commande abc ON bl.bon_commande_id = abc.bon_commande_id
WHERE bl.bon_commande_id IS NOT NULL
AND NOT EXISTS (
    -- Éviter les doublons - ne pas insérer si des articles existent déjà
    SELECT 1 FROM public.articles_bon_livraison abl 
    WHERE abl.bon_livraison_id = bl.id
    AND abl.article_id = abc.article_id
);