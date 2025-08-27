-- Ajouter une politique RLS plus permissive pour les bons de livraison en développement
CREATE POLICY IF NOT EXISTS "Dev: Allow all operations on bons_de_livraison"
ON public.bons_de_livraison
FOR ALL
USING (true)
WITH CHECK (true);

-- Ajouter une politique RLS stricte pour les bons de livraison
CREATE POLICY IF NOT EXISTS "STRICT_bons_de_livraison_read"
ON public.bons_de_livraison
FOR SELECT
USING (
    check_user_permission_strict('Achats'::text, 'Bons de livraison'::text, 'read'::text)
);

CREATE POLICY IF NOT EXISTS "STRICT_bons_de_livraison_write"
ON public.bons_de_livraison
FOR INSERT
WITH CHECK (
    check_user_permission_strict('Achats'::text, 'Bons de livraison'::text, 'write'::text)
);

CREATE POLICY IF NOT EXISTS "STRICT_bons_de_livraison_update"
ON public.bons_de_livraison
FOR UPDATE
USING (
    check_user_permission_strict('Achats'::text, 'Bons de livraison'::text, 'write'::text)
);

CREATE POLICY IF NOT EXISTS "STRICT_bons_de_livraison_delete"
ON public.bons_de_livraison
FOR DELETE
USING (
    check_user_permission_strict('Achats'::text, 'Bons de livraison'::text, 'write'::text)
);