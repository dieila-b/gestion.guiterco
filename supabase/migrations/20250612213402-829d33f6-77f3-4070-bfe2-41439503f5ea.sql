
-- Supprimer les contraintes de clés étrangères existantes redondantes
ALTER TABLE public.articles_bon_commande 
DROP CONSTRAINT IF EXISTS articles_bon_commande_article_id_fkey;

ALTER TABLE public.articles_bon_commande 
DROP CONSTRAINT IF EXISTS fk_articles_bon_commande_article_id;

-- Recréer une seule contrainte de clé étrangère claire
ALTER TABLE public.articles_bon_commande 
ADD CONSTRAINT articles_bon_commande_article_id_fkey 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;

-- Faire de même pour articles_bon_livraison pour éviter le même problème
ALTER TABLE public.articles_bon_livraison 
DROP CONSTRAINT IF EXISTS articles_bon_livraison_article_id_fkey;

ALTER TABLE public.articles_bon_livraison 
DROP CONSTRAINT IF EXISTS fk_articles_bon_livraison_article_id;

-- Recréer une seule contrainte de clé étrangère claire
ALTER TABLE public.articles_bon_livraison 
ADD CONSTRAINT articles_bon_livraison_article_id_fkey 
FOREIGN KEY (article_id) REFERENCES public.catalogue(id) ON DELETE CASCADE;

-- Vérifier et nettoyer les autres contraintes redondantes si elles existent
ALTER TABLE public.articles_bon_commande 
DROP CONSTRAINT IF EXISTS fk_articles_bon_commande_bon_id;

ALTER TABLE public.articles_bon_commande 
ADD CONSTRAINT fk_articles_bon_commande_bon_id 
FOREIGN KEY (bon_commande_id) REFERENCES public.bons_de_commande(id) ON DELETE CASCADE;

ALTER TABLE public.articles_bon_livraison 
DROP CONSTRAINT IF EXISTS fk_articles_bon_livraison_bon_id;

ALTER TABLE public.articles_bon_livraison 
ADD CONSTRAINT fk_articles_bon_livraison_bon_id 
FOREIGN KEY (bon_livraison_id) REFERENCES public.bons_de_livraison(id) ON DELETE CASCADE;
