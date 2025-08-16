-- Enable RLS on tables that don't have it
ALTER TABLE public.livraison_statut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for livraison_statut (lookup table - read-only for authenticated users)
CREATE POLICY "Authenticated users can read livraison_statut"
ON public.livraison_statut
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add RLS policies for unites (lookup table - read-only for authenticated users)
CREATE POLICY "Authenticated users can read unites"
ON public.unites
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin users can manage unites
CREATE POLICY "Admin users can manage unites"
ON public.unites
FOR ALL
USING (check_user_permission_strict('Paramètres', 'Configuration', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Configuration', 'write'));

-- Add RLS policies for villes (lookup table - read-only for authenticated users)
CREATE POLICY "Authenticated users can read villes"
ON public.villes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admin users can manage villes
CREATE POLICY "Admin users can manage villes"
ON public.villes
FOR ALL
USING (check_user_permission_strict('Paramètres', 'Configuration', 'write'))
WITH CHECK (check_user_permission_strict('Paramètres', 'Configuration', 'write'));

-- Add security comments
COMMENT ON TABLE public.livraison_statut IS 'RLS enabled - Read access for authenticated users only';
COMMENT ON TABLE public.unites IS 'RLS enabled - Read access for authenticated users, admin management';
COMMENT ON TABLE public.villes IS 'RLS enabled - Read access for authenticated users, admin management';